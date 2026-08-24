import { NotFoundException } from '@nestjs/common';

export class DeliveryRouteNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'DELIVERY_ROUTE_NOT_FOUND',
      message: 'The requested delivery route does not exist',
    });
  }
}
