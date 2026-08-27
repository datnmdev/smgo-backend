import { BadRequestException } from '@nestjs/common';

export class CannotTransitionRouteToCompletedException extends BadRequestException {
  constructor() {
    super({
      error: 'CANNOT_TRANSITION_ROUTE_TO_COMPLETED',
      message:
        'Cannot transition the route to the completed state because the current state is not delivering, or not all orders have been delivered',
    });
  }
}
