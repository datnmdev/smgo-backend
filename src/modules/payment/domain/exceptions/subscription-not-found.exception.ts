import { BadRequestException } from '@nestjs/common';

export class SubscriptionNotFoundException extends BadRequestException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_NOT_FOUND',
      message: 'The subscription could not be found',
    });
  }
}
