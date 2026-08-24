import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderAlreadyCheckedException extends BadRequestException {
  constructor() {
    super({
      error: 'DELIVERY_ORDER_ALREADY_CHECKED',
      message: 'The delivery order has already been checked',
    });
  }
}
