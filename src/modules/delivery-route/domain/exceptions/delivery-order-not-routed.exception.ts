import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderNotRoutedException extends BadRequestException {
  constructor() {
    super({
      error: 'DELIVERY_ORDER_NOT_ROUTED',
      message:
        'Cannot confirm scheduling because the delivery order has not been routed by the system yet',
    });
  }
}
