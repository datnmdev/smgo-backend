import { NotFoundException } from '@nestjs/common';

export class DeliveryOrderNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'DELIVERY_ORDER_NOT_FOUND',
      message: 'The requested delivery order does not exist',
    });
  }
}
