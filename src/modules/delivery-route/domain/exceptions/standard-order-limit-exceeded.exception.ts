import { ForbiddenException } from '@nestjs/common';

export class StandardOrderLimitExceededException extends ForbiddenException {
  constructor() {
    super({
      error: 'ORDER_LIMIT_EXCEEDED',

      message: 'You have exceeded the 30-order limit of the Standard plan',
    });
  }
}
