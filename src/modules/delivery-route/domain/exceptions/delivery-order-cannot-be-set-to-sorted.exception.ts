import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderCannotBeSetToSortedException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_ROUTE_PHASE_FOR_SORTING',
      message:
        'Cannot update the delivery order status to sorted because the route is not in the order sorting phase',
    });
  }
}
