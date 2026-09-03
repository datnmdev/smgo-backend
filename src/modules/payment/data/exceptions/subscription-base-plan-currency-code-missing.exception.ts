import { InternalServerErrorException } from '@nestjs/common';

export class SubscriptionBasePlanCurrencyCodeMissingException extends InternalServerErrorException {
  constructor(productId: string, basePlanId: string) {
    super({
      error: 'SUBSCRIPTION_BASE_PLAN_CURRENCY_CODE_MISSING',
      message: `The Google Play base plan price does not contain a currency code: ${productId}/${basePlanId}`,
    });
  }
}
