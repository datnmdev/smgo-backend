import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderNotRoutedException extends BadRequestException {
  constructor() {
    super({
      error: 'DELIVERY_ORDER_NOT_ROUTED',
      message:
        'Cannot sort delivery orders because some orders have not been routed ',
    });
  }
}
