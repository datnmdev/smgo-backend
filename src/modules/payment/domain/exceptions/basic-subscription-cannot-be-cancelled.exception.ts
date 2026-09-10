import { BadRequestException } from '@nestjs/common';

export class BasicSubscriptionCannotBeCanceledException extends BadRequestException {
  constructor() {
    super({
      error: 'BASIC_SUBSCRIPTION_CANNOT_BE_CANCELED',
      message: 'The basic subscription cannot be canceled',
    });
  }
}
