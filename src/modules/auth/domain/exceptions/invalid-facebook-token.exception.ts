import { UnauthorizedException } from '@nestjs/common';

export class InvalidFacebookTokenException extends UnauthorizedException {
  constructor() {
    super({
      error: 'INVALID_FACEBOOK_TOKEN',
      message: 'The provided Facebook token is invalid',
    });
  }
}