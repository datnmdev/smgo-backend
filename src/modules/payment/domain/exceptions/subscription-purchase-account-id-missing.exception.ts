import { BadRequestException } from '@nestjs/common';

export class SubscriptionPurchaseAccountIdMissingException extends BadRequestException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_PURCHASE_ACCOUNT_ID_MISSING',
      message: 'The subscription purchase is not linked to an application user',
    });
  }
}
