import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderCannotBeSetToDeliveredException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_ROUTE_PHASE_FOR_DELIVERY',
      message:
        'Cannot update the delivery order status to delivered because the route is not in the delivery phase',
    });
  }
}
