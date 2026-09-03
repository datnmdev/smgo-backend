import { InternalServerErrorException } from '@nestjs/common';

export class SubscriptionBasePlanIdMissingException extends InternalServerErrorException {
  constructor(productId: string) {
    super({
      error: 'SUBSCRIPTION_BASE_PLAN_ID_MISSING',
      message: `The Google Play subscription does not contain a base plan ID: ${productId}`,
    });
  }
}
