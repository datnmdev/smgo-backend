import { UnauthorizedException } from '@nestjs/common';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      error: 'INVALID_REFRESH_TOKEN',
      message: 'The provided refresh token is invalid or has expired',
    });
  }
}
