import { NotFoundException } from '@nestjs/common';

export class MediaNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'MEDIA_NOT_FOUND',
      message: 'The requested media does not exist',
    });
  }
}
