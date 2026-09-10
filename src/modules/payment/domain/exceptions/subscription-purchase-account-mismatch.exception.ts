import { BadRequestException } from '@nestjs/common';

export class SubscriptionPurchaseAccountMismatchException extends BadRequestException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_PURCHASE_ACCOUNT_MISMATCH',
      message: 'The subscription purchase does not belong to the current user',
    });
  }
}
