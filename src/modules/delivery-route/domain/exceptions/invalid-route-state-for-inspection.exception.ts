import { BadRequestException } from '@nestjs/common';

export class InvalidRouteStateForInspectionException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_ROUTE_STATE_FOR_INSPECTION',
      message:
        'Cannot transition the route to the inspection state because its current state is neither inspection nor sorting',
    });
  }
}
