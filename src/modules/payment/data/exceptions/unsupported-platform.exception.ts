import { BadRequestException } from '@nestjs/common';

export class UnsupportedPlatformException extends BadRequestException {
  constructor() {
    super({
      error: 'UNSUPPORTED_PLATFORM',
      message: 'The platform is not supported',
    });
  }
}
