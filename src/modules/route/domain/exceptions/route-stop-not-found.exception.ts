import { NotFoundException } from '@nestjs/common';

export class RouteStopNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'ROUTE_STOP_NOT_FOUND',
      message: 'The requested route stop does not exist',
    });
  }
}
