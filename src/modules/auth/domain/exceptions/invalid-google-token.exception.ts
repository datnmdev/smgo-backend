import { UnauthorizedException } from '@nestjs/common';

export class InvalidGoogleTokenException extends UnauthorizedException {
  constructor() {
    super({
      error: 'INVALID_GOOGLE_TOKEN',
      message: 'The provided Google token is invalid',
    });
  }
}