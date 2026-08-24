import { BadRequestException } from '@nestjs/common';

export class DeliveryOrderCannotBeSetToPendingInspectionException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_ROUTE_PHASE_FOR_INSPECTION',
      message:
        'Cannot update the delivery order status to pending inspection because the route is not in the preparation phase',
    });
  }
}
