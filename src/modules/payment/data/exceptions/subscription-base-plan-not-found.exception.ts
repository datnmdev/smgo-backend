import { NotFoundException } from '@nestjs/common';

export class SubscriptionBasePlanNotFoundException extends NotFoundException {
  constructor(productId: string, basePlanId: string) {
    super({
      error: 'SUBSCRIPTION_BASE_PLAN_NOT_FOUND',
      message: `Google Play base plan not found: ${productId}/${basePlanId}`,
    });
  }
}
