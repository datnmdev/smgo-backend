import { Injectable } from '@nestjs/common';
import { TokenBlacklistRepository } from '../repositories/token-blacklist.repository';

@Injectable()
export class IsBlacklistedUsecase {
  constructor(
    private readonly tokenBlacklistRepo: TokenBlacklistRepository,
  ) {}

  async execute(sessionId: string): Promise<boolean> {
    return this.tokenBlacklistRepo.isBlacklisted(sessionId);
  }
}
