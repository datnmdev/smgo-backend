import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderCannotBeSetToRescheduledException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_ROUTE_PHASE_FOR_DELIVERY',
      message:
        'Cannot update the delivery order status to rescheduled because the route is not in the delivery phase',
    });
  }
}
