import { BadRequestException } from '@nestjs/common';

export class SubscriptionInactiveException extends BadRequestException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_INACTIVE',
      message: 'The subscription is no longer active or has been canceled',
    });
  }
}
