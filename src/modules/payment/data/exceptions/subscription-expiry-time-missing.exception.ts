import { InternalServerErrorException } from '@nestjs/common';

export class SubscriptionExpiryTimeMissingException extends InternalServerErrorException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_EXPIRY_TIME_MISSING',
      message: 'The subscription does not contain an expiry time',
    });
  }
}
