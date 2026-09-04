import { GetCurrentSubscriptionUsecase } from '@/modules/payment/domain/usecases/get-current-subscription.usecase';
import { Injectable } from '@nestjs/common';
import { SubscriptionPlanNotFoundException } from '../exceptions/subscription-plan-not-found.usecase';
import { BasicOrderLimitExceededException } from '../exceptions/basic-order-limit-exceeded.exception';
import { StandardOrderLimitExceededException } from '../exceptions/standard-order-limit-exceeded.exception';
import { PlusOrderLimitExceededException } from '../exceptions/plus-order-limit-exceeded.exception';
import { InvalidSubscriptionPlanException } from '../exceptions/invalid-subscription-plan.exception';
import { LocationSharingNotAllowedException } from '../exceptions/location-sharing-not-allowed.exception';

@Injectable()
export class CheckPlanUsecase {
  constructor(
    private readonly getCurrentPlanUsecase: GetCurrentSubscriptionUsecase,
  ) {}

  async execute(
    userId: string,
    options: {
      orderCount?: number;
      requiresLocationSharing?: boolean;
    },
  ): Promise<void> {
    const currentPlan = await this.getCurrentPlanUsecase.execute(userId);

    if (!currentPlan) {
      throw new SubscriptionPlanNotFoundException();
    }

    if (typeof options.orderCount === 'number') {
      switch (currentPlan.productId) {
        case 'smgo_basic':
          if (options.orderCount > 5) {
            throw new BasicOrderLimitExceededException();
          }
          break;

        case 'smgo_standard':
          if (options.orderCount > 30) {
            throw new StandardOrderLimitExceededException();
          }
          break;

        case 'smgo_plus':
          if (options.orderCount > 50) {
            throw new PlusOrderLimitExceededException();
          }
          break;

        case 'smgo_premium':
          break;

        default:
          throw new InvalidSubscriptionPlanException(currentPlan.productId);
      }
    }

    if (
      options.requiresLocationSharing &&
      currentPlan.productId !== 'smgo_plus' &&
      currentPlan.productId !== 'smgo_premium'
    ) {
      throw new LocationSharingNotAllowedException(currentPlan.productId);
    }
  }
}
