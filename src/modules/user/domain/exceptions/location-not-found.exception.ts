import { NotFoundException } from '@nestjs/common';

export class LocationNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'LOCATION_NOT_FOUND',
      message: 'The requested location does not exist',
    });
  }
}
