import { BadRequestException } from '@nestjs/common';

export class InvalidDeliveryOrderStatusTransitionException extends BadRequestException {
  constructor(
    message: string,
    errorCode: string = 'INVALID_DELIVERY_ORDER_STATUS_TRANSITION',
  ) {
    super({
      error: errorCode,
      message: message,
    });
  }
}
