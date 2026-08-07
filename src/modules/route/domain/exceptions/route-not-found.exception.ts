import { NotFoundException } from '@nestjs/common';

export class RouteNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'ROUTE_NOT_FOUND',
      message: 'The requested route does not exist',
    });
  }
}
