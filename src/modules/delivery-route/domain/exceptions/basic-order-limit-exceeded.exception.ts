import { ForbiddenException } from '@nestjs/common';

export class BasicOrderLimitExceededException extends ForbiddenException {
  constructor() {
    super({
      error: 'ORDER_LIMIT_EXCEEDED',

      message: 'You have exceeded the 10-order limit of the Basic plan',
    });
  }
}
