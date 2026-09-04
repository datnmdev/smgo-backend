import { ForbiddenException } from '@nestjs/common';

export class PlusOrderLimitExceededException extends ForbiddenException {
  constructor() {
    super({
      error: 'ORDER_LIMIT_EXCEEDED',

      message: 'You have exceeded the 50-order limit of the Plus plan',
    });
  }
}
