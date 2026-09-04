import { BadRequestException } from '@nestjs/common';

export class InvalidSubscriptionPlanException extends BadRequestException {
  constructor(productId: string) {
    super({
      error: 'INVALID_SUBSCRIPTION_PLAN',

      message: `The service plan '${productId}' is invalid`,
    });
  }
}
