import { BadRequestException } from '@nestjs/common';

export class SubscriptionPurchaseNotVerifiedException extends BadRequestException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_PURCHASE_NOT_VERIFIED',
      message:
        'The subscription purchase has not been verified or linked to the user yet',
    });
  }
}
