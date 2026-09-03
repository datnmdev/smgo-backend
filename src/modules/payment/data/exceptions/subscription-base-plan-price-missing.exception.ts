import { InternalServerErrorException } from '@nestjs/common';

export class SubscriptionBasePlanPriceMissingException extends InternalServerErrorException {
  constructor(productId: string, basePlanId: string) {
    super({
      error: 'SUBSCRIPTION_BASE_PLAN_PRICE_MISSING',
      message: `The Google Play base plan does not contain a price: ${productId}/${basePlanId}`,
    });
  }
}
