import { Injectable } from '@nestjs/common';
import { TokenBlacklistRepository } from '../repositories/token-blacklist.repository';
import { TokenProvider } from '../services/token-provider.service';

@Injectable()
export class IsBlacklistedUsecase {
  constructor(
    private readonly tokenBlacklistRepo: TokenBlacklistRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(token: string): Promise<boolean> {
    const tokenPayload = await this.tokenProvider.decode(token);
    return this.tokenBlacklistRepo.isBlacklisted(tokenPayload.sessionId);
  }
}
