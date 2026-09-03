import { BadRequestException } from '@nestjs/common';

export class InvalidGooglePlayPayloadException extends BadRequestException {
  constructor() {
    super({
      error: 'INVALID_GOOGLE_PLAY_PAYLOAD',
      message: 'Payload in message.data has an invalid Google Play format',
    });
  }
}
