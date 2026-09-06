import { Injectable } from '@nestjs/common';
import { ShareLocationTokenRepository } from '../repositories/share-location-token.repository';
import { TCoordinate } from '../entities/location.entity';

@Injectable()
export class SaveShareLocationUsecase {
  constructor(
    private readonly shareLocationTokenRepo: ShareLocationTokenRepository,
  ) {}

  async execute(tokenKey: string, coordinate: TCoordinate): Promise<void> {
    await this.shareLocationTokenRepo.saveShareLocation(tokenKey, coordinate);
  }
}
