import { BadRequestException } from '@nestjs/common';

export class CannotTransitionRouteToSortException extends BadRequestException {
  constructor() {
    super({
      error: 'CANNOT_TRANSITION_ROUTE_TO_SORT',
      message:
        'Cannot transition the route to the sorting state because the current state is not inspection, or not all orders have been confirmed as checked',
    });
  }
}
