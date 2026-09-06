import { Injectable } from '@nestjs/common';
import { ShareLocationTokenRepository } from '../repositories/share-location-token.repository';
import { TCoordinate } from '../entities/location.entity';

@Injectable()
export class GetShareLocationUsecase {
  constructor(
    private readonly shareLocationTokenRepo: ShareLocationTokenRepository,
  ) {}

  execute(tokenKey: string): Promise<TCoordinate | null> {
    return this.shareLocationTokenRepo.getShareLocation(tokenKey);
  }
}
