import { NotFoundException } from '@nestjs/common';

export class SubscriptionPlanNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'SUBSCRIPTION_PLAN_NOT_FOUND',

      message: 'The user subscription plan information could not be found',
    });
  }
}
