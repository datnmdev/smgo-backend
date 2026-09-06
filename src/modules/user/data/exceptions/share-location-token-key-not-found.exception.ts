import { NotFoundException } from '@nestjs/common';

export class ShareLocationTokenKeyNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'SHARE_LOCATION_TOKEN_KEY_NOT_FOUND',
      message: 'The requested share location token key does not exist',
    });
  }
}
