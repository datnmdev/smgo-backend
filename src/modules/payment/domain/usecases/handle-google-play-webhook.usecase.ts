import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DeveloperNotificationDto } from '../../presentation/dtos/handle-google-play-webhook.dto';
import { validate } from 'class-validator';
import { InvalidGooglePlayPayloadException } from '../exceptions/invalid-google-play-payload.exception';
import {
  AndroidTransaction,
  SubscriptionPurchaseResult,
  SubscriptionRepository,
} from '../repositories/subscription.repository';
import { SubscriptionPurchaseNotVerifiedException } from '../exceptions/subscription-purchase-not-verified.exception';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { PaymentTransactionRepository } from '../repositories/payment_transaction.repository';
import { TSubscription } from '../entities/subscription.entity';
import {
  GoogleNotificationTypeMap,
  TEventType,
} from '../entities/payment-transaction.entity';

@Injectable()
export class HandleGooglePlayWebhookUsecase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly uowService: UnitOfWorkService,
    private readonly paymentTransactionRepo: PaymentTransactionRepository,
  ) {}

  async execute(data: string): Promise<void> {
    /*
     * Parse/validate trước transaction.
     * Tránh return sau khi transaction đã start.
     */
    const decodedJson = Buffer.from(data, 'base64').toString('utf-8');

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(decodedJson);
    } catch {
      throw new InvalidGooglePlayPayloadException();
    }

    const notification = plainToInstance(DeveloperNotificationDto, parsedData);

    const errors = await validate(notification);

    if (errors.length > 0) {
      throw new InvalidGooglePlayPayloadException();
    }

    if (!notification.subscriptionNotification) {
      return;
    }

    const { notificationType, purchaseToken } =
      notification.subscriptionNotification;

    const purchase = await this.subscriptionRepo.getSubscriptionPurchase(
      'android',
      purchaseToken,
    );

    let currentSubscription = (
      await this.subscriptionRepo.getSubscriptions({
        purchaseToken,
      })
    )[0];

    /*
     * CASE 3:
     * Re-subscribe ngoài Google Play
     * sau khi subscription cũ đã expired.
     */
    if (!currentSubscription && notificationType === 4) {
      const outOfAppContext = purchase.subscription.outOfAppPurchaseContext;

      /*
       * Ưu tiên tìm bằng token cũ.
       */
      if (outOfAppContext?.expiredPurchaseToken) {
        currentSubscription = (
          await this.subscriptionRepo.getSubscriptions({
            purchaseToken: outOfAppContext.expiredPurchaseToken,
          })
        )[0];
      }

      /*
       * Fallback.
       *
       * Hữu ích cho dữ liệu cũ nếu trước đây
       * SmGo đã xóa purchaseToken khi expired.
       */
      if (!currentSubscription && outOfAppContext?.expiredExternalAccountId) {
        currentSubscription = (
          await this.subscriptionRepo.getSubscriptions({
            userId: outOfAppContext.expiredExternalAccountId,
          })
        )[0];
      }
    }

    if (!currentSubscription) {
      throw new SubscriptionPurchaseNotVerifiedException();
    }

    const uowManager = await this.uowService.create(ORMType.TYPEORM);

    let shouldAcknowledgePurchased = false;

    await transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();

        switch (notificationType) {
          case 1:
            // SUBSCRIPTION_RECOVERED
            await this.handleRecovered(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 2:
            // SUBSCRIPTION_RENEWED
            await this.handleRenewed(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 3:
            // SUBSCRIPTION_CANCELED
            await this.handleCanceled(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 4:
            await this.handlePurchased(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            shouldAcknowledgePurchased = true;
            break;

          case 5:
            // SUBSCRIPTION_ON_HOLD
            await this.handleOnHold(currentSubscription, uowManager.manager);
            break;

          case 6:
            // SUBSCRIPTION_IN_GRACE_PERIOD
            await this.handleGracePeriod(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 7:
            // SUBSCRIPTION_RESTARTED
            await this.handleRestarted(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 8:
            // SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
            // Deprecated, chỉ log transaction.
            break;

          case 9:
            // SUBSCRIPTION_DEFERRED
            await this.handleDeferred(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 10:
            // SUBSCRIPTION_PAUSED
            await this.handlePaused(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 11:
            // SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
            // Chưa cần thay entitlement.
            break;

          case 12:
            // SUBSCRIPTION_REVOKED
            await this.handleRevoked(currentSubscription, uowManager.manager);
            break;

          case 13:
            // SUBSCRIPTION_EXPIRED
            await this.handleExpired(currentSubscription, uowManager.manager);
            break;

          case 17:
            // SUBSCRIPTION_ITEMS_CHANGED
            await this.handleItemsChanged(
              purchase,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 18:
            // SUBSCRIPTION_CANCELLATION_SCHEDULED
            // Installment subscription.
            // Không hạ quyền ngay.
            break;

          case 19:
            // SUBSCRIPTION_PRICE_CHANGE_UPDATED
            // Không thay entitlement.
            break;

          case 20:
            // SUBSCRIPTION_PENDING_PURCHASE_CANCELED
            // Pending purchase chưa từng được cấp entitlement.
            // Không thay subscription hiện tại.
            break;

          case 22:
            // SUBSCRIPTION_PRICE_STEP_UP_CONSENT_UPDATED
            // Không thay entitlement.
            break;

          default:
            // Event mới Google bổ sung trong tương lai:
            // không crash webhook.
            break;
        }

        await this.saveTransaction(
          notificationType,
          purchase,
          currentSubscription,
          uowManager.manager,
        );

        await this.uowService.commit();
      } catch (error) {
        await this.uowService.rollback();
        throw error;
      } finally {
        await this.uowService.release();
      }
    });

    if (shouldAcknowledgePurchased && purchase.subscription.productId) {
      await this.subscriptionRepo.acknowledgeAndroidPurchase(
        purchase.subscription.purchaseToken,
        purchase.subscription.productId,
      );
    }
  }

  private async handlePurchased(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    const { subscription } = purchase;

    if (!subscription.productId) {
      throw new SubscriptionPurchaseNotVerifiedException();
    }

    if (!subscription.expiresAt) {
      throw new SubscriptionPurchaseNotVerifiedException();
    }

    const usableStates = [
      'SUBSCRIPTION_STATE_ACTIVE',
      'SUBSCRIPTION_STATE_CANCELED',
      'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
    ];

    const isAvailable =
      subscription.expiresAt.getTime() > Date.now() &&
      usableStates.includes(subscription.state ?? '');

    if (!isAvailable) {
      throw new SubscriptionPurchaseNotVerifiedException();
    }

    const status =
      subscription.state === 'SUBSCRIPTION_STATE_CANCELED'
        ? 'CANCELED'
        : subscription.state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'
          ? 'IN_GRACE_PERIOD'
          : 'ACTIVE';

    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        productId: subscription.productId,

        purchaseToken: subscription.purchaseToken,

        startsAt: subscription.startsAt ?? new Date(),

        expiresAt: subscription.expiresAt,

        autoRenew: subscription.isAutoRenew ?? false,

        status,
      },
      manager,
    );
  }

  private async handleRenewed(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,

        autoRenew: purchase.subscription.isAutoRenew ?? true,

        status: 'ACTIVE',
      },
      manager,
    );
  }

  private async handleCanceled(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,

        autoRenew: false,
        status: 'CANCELED',
      },
      manager,
    );
  }

  private async handleRecovered(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,

        autoRenew: purchase.subscription.isAutoRenew ?? true,

        status: 'ACTIVE',
      },
      manager,
    );
  }

  private async handleGracePeriod(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,

        autoRenew:
          purchase.subscription.isAutoRenew ?? currentSubscription.autoRenew,

        status: 'IN_GRACE_PERIOD',
      },
      manager,
    );
  }

  private async handleOnHold(currentSubscription: TSubscription, manager: any) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        status: 'ON_HOLD',
      },
      manager,
    );
  }

  private async handleRestarted(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,
        autoRenew: true,
        status: 'ACTIVE',
      },
      manager,
    );
  }

  private async handleDeferred(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    /*
     * Deferred thay đổi expiry/renewal date.
     */
    if (!purchase.subscription.expiresAt) {
      return;
    }

    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt: purchase.subscription.expiresAt,
      },
      manager,
    );
  }

  private async handlePaused(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        status: 'PAUSED',
        autoRenew:
          purchase.subscription.isAutoRenew ?? currentSubscription.autoRenew,
        expiresAt:
          purchase.subscription.expiresAt ?? currentSubscription.expiresAt,
      },
      manager,
    );
  }

  private async handleItemsChanged(
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    const { subscription } = purchase;

    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        ...(subscription.productId
          ? {
              productId: subscription.productId,
            }
          : {}),

        ...(subscription.expiresAt
          ? {
              expiresAt: subscription.expiresAt,
            }
          : {}),

        ...(subscription.isAutoRenew !== null
          ? {
              autoRenew: subscription.isAutoRenew,
            }
          : {}),
      },
      manager,
    );
  }

  private async handleExpired(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.resetToBasic(currentSubscription, manager);
  }

  private async handleRevoked(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.resetToBasic(currentSubscription, manager);
  }

  private async resetToBasic(currentSubscription: TSubscription, manager: any) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        status: 'ACTIVE',

        autoRenew: null,

        /*
         * QUAN TRỌNG:
         *
         * Không xóa purchaseToken.
         *
         * Token expired cũ chính là mapping:
         *
         * expiredPurchaseToken
         *        ↓
         * currentSubscription
         *        ↓
         * userId
         *
         * cho CASE 3.
         */
        productId: 'smgo_basic',

        startsAt: new Date(),

        expiresAt: null,
      },
      manager,
    );
  }

  private async saveTransaction(
    notificationType: number,
    purchase: SubscriptionPurchaseResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    const transaction = purchase.transaction;
    await this.paymentTransactionRepo.createPaymentTransaction(
      {
        userId: currentSubscription.userId,
        orderId: transaction.orderId,
        productId: transaction.productId ?? currentSubscription.productId,
        purchaseToken: transaction.purchaseToken,
        eventType: this.parseNotificationTypeToString(notificationType),
        priceCurrency: transaction.priceCurrency ?? '',
        amount: this.shouldRecordAmount(notificationType)
          ? (transaction.amount ?? 0).toString()
          : '0',
        rawPayload: transaction.rawPayload,
      },
      manager,
    );
  }
  private shouldRecordAmount(notificationType: number): boolean {
    return [2, 4].includes(notificationType);
  }

  private parseNotificationTypeToString(type: number): TEventType {
    return GoogleNotificationTypeMap[type] ?? 'UNKNOWN';
  }
}
