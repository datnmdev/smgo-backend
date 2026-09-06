import { Injectable } from '@nestjs/common';
import { ShareLocationTokenRepository } from '../repositories/share-location-token.repository';
import { TShareLocationPayload } from '../entities/share-location.entity';

@Injectable()
export class CheckShareLocationTokenUsecase {
  constructor(
    private readonly shareLocationTokenRepo: ShareLocationTokenRepository,
  ) {}

  async execute(tokenKey: string): Promise<TShareLocationPayload> {
    return this.shareLocationTokenRepo.verify(tokenKey);
  }
}
