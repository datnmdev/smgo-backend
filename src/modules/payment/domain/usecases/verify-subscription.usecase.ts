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
        // Xác thực purchase token
        const result = await this.subscriptionRepo.verify(
          platform,
          purchaseToken,
        );

        // Áp dụng gói cho user
        const currSubscription = (
          await this.subscriptionRepo.getSubscriptions({
            userId,
          })
        )?.[0];
        if (!currSubscription) {
          await this.subscriptionRepo.createSubscription(
            {
              userId,
              productId: result.subscription.productId,
              purchaseToken: result.subscription.purchaseToken,
              startsAt: result.subscription.startsAt,
              expiresAt: result.subscription.expiresAt,
              autoRenew: result.subscription.isAutoRenew,
              status: 'ACTIVE',
            },
            uowManager.manager,
          );
        } else {
          await this.subscriptionRepo.updateSubscription(
            currSubscription.id,
            {
              productId: result.subscription.productId,
              purchaseToken: result.subscription.purchaseToken,
              startsAt: result.subscription.startsAt,
              expiresAt: result.subscription.expiresAt,
              autoRenew: result.subscription.isAutoRenew,
              status: 'ACTIVE',
            },
            uowManager.manager,
          );
        }
        await this.subscriptionRepo.acknowledgeAndroidPurchase(
          result.subscription.purchaseToken,
          result.subscription.productId,
        );
        await this.uowService.commit();
        return true;
      } catch {
        await this.uowService.rollback();
        return false;
      } finally {
        await this.uowService.release();
      }
    });
  }
}
