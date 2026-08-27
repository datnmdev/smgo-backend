import { BadRequestException } from '@nestjs/common';

export class CannotTransitionRouteToDeliveringException extends BadRequestException {
  constructor() {
    super({
      error: 'CANNOT_TRANSITION_ROUTE_TO_DELIVERING',
      message:
        'Cannot transition the route to the delivering state because the current state is not sorting, or not all orders have been sorted',
    });
  }
}
