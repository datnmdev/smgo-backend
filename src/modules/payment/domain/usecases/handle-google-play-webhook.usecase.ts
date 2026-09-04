import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DeveloperNotificationDto } from '../../presentation/dtos/handle-google-play-webhook.dto';
import { validate } from 'class-validator';
import { InvalidGooglePlayPayloadException } from '../exceptions/invalid-google-play-payload.exception';
import {
  AndroidTransaction,
  SubscriptionRepository,
  VerifySubscriptionResult,
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
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    await transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        let parsedData: any;
        const decodedJson = Buffer.from(data, 'base64').toString('utf-8');
        parsedData = JSON.parse(decodedJson);
        const notification = plainToInstance(
          DeveloperNotificationDto,
          parsedData,
        );
        const errors = await validate(notification);
        if (errors.length > 0) {
          throw new InvalidGooglePlayPayloadException();
        }
        if (!notification.subscriptionNotification) {
          return;
        }
        const { notificationType, purchaseToken } =
          notification.subscriptionNotification;

        const verifySubscriptionResult = await this.subscriptionRepo.verify(
          'android',
          purchaseToken,
        );
        const currentSubscription = (
          await this.subscriptionRepo.getSubscriptions({
            purchaseToken: purchaseToken,
          })
        )?.[0];
        if (!currentSubscription) {
          throw new SubscriptionPurchaseNotVerifiedException();
        }

        // Cập nhật subscription theo dòng sự kiên từ google
        switch (notificationType) {
          case 4: // SUBSCRIPTION_PURCHASED (Mua mới / Nâng cấp / Hạ cấp)
            // Không làm gì cả vì dữ liệu đã được cập nhật khi verify purchase token bởi client
            break;

          case 2: // SUBSCRIPTION_RENEWED (Gia hạn thành công)
            await this.handleRenewed(
              verifySubscriptionResult,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 3: // SUBSCRIPTION_CANCELED (Hủy gia hạn tự động)
            await this.handleCanceled(currentSubscription, uowManager.manager);
            break;

          case 1: // SUBSCRIPTION_RECOVERED (Khôi phục sau lỗi thẻ)
            await this.handleRecovered(
              verifySubscriptionResult,
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 6: // SUBSCRIPTION_IN_GRACE_PERIOD (Ân hạn nợ cước)
            await this.handleGracePeriod(
              currentSubscription,
              uowManager.manager,
            );
            break;

          case 5: // SUBSCRIPTION_ON_HOLD (Tạm khóa nợ cước)
            await this.handleOnHold(currentSubscription, uowManager.manager);
            break;

          case 13: // SUBSCRIPTION_EXPIRED (Hết hạn hoàn toàn)
            await this.handleExpired(currentSubscription, uowManager.manager);
            break;

          case 12: // SUBSCRIPTION_REVOKED (Bị hoàn tiền / thu hồi)
            await this.handleRevoked(currentSubscription, uowManager.manager);
            break;

          default:
            break;
        }

        // Ghi lại các sự kiện được gửi về từ google
        let amount = '0';
        if ([2, 4, 12].includes(notificationType)) {
          amount = verifySubscriptionResult.transaction.amount.toString();
        }
        await this.paymentTransactionRepo.createPaymentTransaction(
          {
            userId: currentSubscription.userId,
            orderId: verifySubscriptionResult.transaction.orderId,
            productId: verifySubscriptionResult.transaction.productId,
            purchaseToken: verifySubscriptionResult.transaction.purchaseToken,
            eventType: this.parseNotificationTypeToString(notificationType),
            priceCurrency: verifySubscriptionResult.transaction.priceCurrency,
            amount,
            rawPayload: verifySubscriptionResult.transaction.rawPayload,
          },
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
  }

  // --- LOGIC CHI TIẾT TỪNG CASE ---
  private async handleRenewed(
    verifySubscriptionResult: VerifySubscriptionResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt: verifySubscriptionResult.subscription.expiresAt,
        autoRenew: true,
        status: 'ACTIVE',
      },
      manager,
    );
  }

  private async handleCanceled(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        autoRenew: false,
        status: 'CANCELED',
      },
      manager,
    );
  }

  private async handleRecovered(
    verifySubscriptionResult: VerifySubscriptionResult<AndroidTransaction>,
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        expiresAt: verifySubscriptionResult.subscription.expiresAt,
        autoRenew: true,
        status: 'ACTIVE',
      },
      manager,
    );
  }

  private async handleGracePeriod(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
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

  private async handleExpired(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        status: 'ACTIVE',
        autoRenew: null,
        purchaseToken: null,
        productId: 'smgo_basic',
        startsAt: new Date(),
        expiresAt: null,
      },
      manager,
    );
  }

  private async handleRevoked(
    currentSubscription: TSubscription,
    manager: any,
  ) {
    await this.subscriptionRepo.updateSubscription(
      currentSubscription.id,
      {
        status: 'ACTIVE',
        autoRenew: null,
        purchaseToken: null,
        productId: 'smgo_basic',
        startsAt: new Date(),
        expiresAt: null,
      },
      manager,
    );
  }

  private parseNotificationTypeToString(type: number): TEventType {
    return GoogleNotificationTypeMap[type] ?? 'UNKNOWN';
  }
}
