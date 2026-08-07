import { JwtPayload } from '@/@types/jwt';
import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import dfns from 'date-fns';
import { TokenBlacklistRepository } from '../repositories/token-blacklist.repository';

@Injectable()
export class SignOutUsecase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly tokenBlacklistRepo: TokenBlacklistRepository,
  ) {}

  async execute(authPayload: JwtPayload): Promise<void> {
    const remainingAccessTtl = dfns.differenceInSeconds(
      authPayload.exp * 1000,
      Date.now(),
    );
    if (remainingAccessTtl > 0) {
      await this.tokenBlacklistRepo.add(
        authPayload.sessionId,
        remainingAccessTtl,
      );
    }
    await this.sessionRepo.delete(authPayload.userId, authPayload.sessionId);
  }
}
