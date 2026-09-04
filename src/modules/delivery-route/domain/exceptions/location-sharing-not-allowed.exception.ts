import { ForbiddenException } from '@nestjs/common';

export class LocationSharingNotAllowedException extends ForbiddenException {
  constructor(productId: string) {
    super({
      error: 'LOCATION_SHARING_NOT_ALLOWED',

      message: `Your current plan '${productId}' does not support location sharing`,
    });
  }
}
