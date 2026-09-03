import { InternalServerErrorException } from '@nestjs/common';

export class SubscriptionProductIdMissingException extends InternalServerErrorException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_PRODUCT_ID_MISSING',
      message: 'The Google Play subscription does not contain a product ID',
    });
  }
}