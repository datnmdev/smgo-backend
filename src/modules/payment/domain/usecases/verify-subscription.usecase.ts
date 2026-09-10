import { Injectable } from '@nestjs/common';
import {
  Platform,
  SubscriptionRepository,
} from '../repositories/subscription.repository';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { SubscriptionInactiveException } from '../../data/exceptions/subscription-inactive.exception';
import { SubscriptionProductIdMissingException } from '../../data/exceptions/subscription-product-id-missing.exception';
import { SubscriptionExpiryTimeMissingException } from '../../data/exceptions/subscription-expiry-time-missing.exception';
import { SubscriptionPurchaseAccountIdMissingException } from '../exceptions/subscription-purchase-account-id-missing.exception';
import { SubscriptionPurchaseAccountMismatchException } from '../exceptions/subscription-purchase-account-mismatch.exception';

@Injectable()
export class VerifySubscriptionUsecase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly uowService: UnitOfWorkService,
  ) {}

  async execute(
    userId: string,
    platform: Platform,
    purchaseToken: string,
  ): Promise<boolean> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);

    return transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();

        const result = await this.subscriptionRepo.getSubscriptionPurchase(
          platform,
          purchaseToken,
        );

        const { subscription } = result;

        /*
         * ---------------------------------------------------
         * 1. VERIFY OWNERSHIP
         * ---------------------------------------------------
         *
         * Purchase phải được tạo bởi chính user SmGo
         * đang gọi API.
         *
         * Frontend hiện truyền:
         *
         * PurchaseParam(
         *   applicationUserName: userId,
         * )
         *
         * Android repository map nó về:
         *
         * externalAccountId
         */
        if (!subscription.externalAccountId) {
          throw new SubscriptionPurchaseAccountIdMissingException();
        }

        if (subscription.externalAccountId !== userId) {
          throw new SubscriptionPurchaseAccountMismatchException();
        }

        /*
         * ---------------------------------------------------
         * 2. VERIFY PRODUCT
         * ---------------------------------------------------
         */
        if (!subscription.productId) {
          throw new SubscriptionProductIdMissingException();
        }

        /*
         * ---------------------------------------------------
         * 3. VERIFY EXPIRY
         * ---------------------------------------------------
         */
        if (!subscription.expiresAt) {
          throw new SubscriptionExpiryTimeMissingException();
        }

        /*
         * ---------------------------------------------------
         * 4. VERIFY ENTITLEMENT STATE
         * ---------------------------------------------------
         */
        const usableStates = [
          'SUBSCRIPTION_STATE_ACTIVE',
          'SUBSCRIPTION_STATE_CANCELED',
          'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
        ];

        const isAvailable =
          subscription.expiresAt.getTime() > Date.now() &&
          usableStates.includes(subscription.state ?? '');

        if (!isAvailable) {
          throw new SubscriptionInactiveException();
        }

        /*
         * ---------------------------------------------------
         * 5. CURRENT SUBSCRIPTION
         * ---------------------------------------------------
         */
        const currSubscription = (
          await this.subscriptionRepo.getSubscriptions({
            userId,
          })
        )[0];

        /*
         * ---------------------------------------------------
         * 6. MAP STORE STATE -> DOMAIN STATUS
         * ---------------------------------------------------
         */
        const status =
          subscription.state === 'SUBSCRIPTION_STATE_CANCELED'
            ? 'CANCELED'
            : subscription.state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'
              ? 'IN_GRACE_PERIOD'
              : 'ACTIVE';

        /*
         * ---------------------------------------------------
         * 7. SAVE SUBSCRIPTION
         * ---------------------------------------------------
         */
        if (!currSubscription) {
          await this.subscriptionRepo.createSubscription(
            {
              userId,

              productId: subscription.productId,

              purchaseToken: subscription.purchaseToken,

              startsAt: subscription.startsAt ?? new Date(),

              expiresAt: subscription.expiresAt,

              autoRenew: subscription.isAutoRenew ?? false,

              status,
            },
            uowManager.manager,
          );
        } else {
          await this.subscriptionRepo.updateSubscription(
            currSubscription.id,
            {
              productId: subscription.productId,

              purchaseToken: subscription.purchaseToken,

              startsAt: subscription.startsAt ?? new Date(),

              expiresAt: subscription.expiresAt,

              autoRenew: subscription.isAutoRenew ?? false,

              status,
            },
            uowManager.manager,
          );
        }

        /*
         * ---------------------------------------------------
         * 8. ACKNOWLEDGE
         * ---------------------------------------------------
         *
         * Android-only.
         *
         * Sau này iOS sẽ có completion/verification flow
         * riêng, không được gọi Google acknowledge.
         */
        if (platform === 'android') {
          await this.subscriptionRepo.acknowledgeAndroidPurchase(
            subscription.purchaseToken,
            subscription.productId,
          );
        }

        await this.uowService.commit();

        return true;
      } catch (error) {
        console.log(error);

        await this.uowService.rollback();

        return false;
      } finally {
        await this.uowService.release();
      }
    });
  }
}
