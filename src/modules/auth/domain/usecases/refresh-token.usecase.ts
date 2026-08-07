import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { TokenProvider } from '../services/token-provider.service';
import { JwtPayload, JwtTokens } from '@/@types/jwt';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';
import { v4 } from 'uuid';
import {
  DeviceInfo,
  Session,
} from '@/@types/modules/auth/domain/repositories/session.repository';
import dfns from 'date-fns';

@Injectable()
export class RefreshTokenUsecase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(
    refreshToken: string,
    deviceInfo: DeviceInfo,
  ): Promise<JwtTokens> {
    // Xác thực refresh token người dùng gửi lên
    let tokenPayload: JwtPayload;
    try {
      tokenPayload = await this.tokenProvider.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenException();
    }

    // Kiểm tra session
    const session = await this.sessionRepo.findByIdAndUserId(
      tokenPayload.userId,
      tokenPayload.sessionId,
    );
    if (!session) {
      throw new InvalidRefreshTokenException();
    }
    const rfTokenHash = await this.tokenProvider.hashToken(refreshToken);
    if (rfTokenHash !== session.refreshTokenHash) {
      throw new InvalidRefreshTokenException();
    }

    // Xoá session cũ
    await this.sessionRepo.delete(session.userId, session.sessionId);

    // Cấp token mới
    const sessionId = v4();
    const now = Date.now();
    const newPayload: JwtPayload = {
      userId: tokenPayload.userId,
      sessionId,
    };
    const newTokens = await this.tokenProvider.generateTokens(newPayload);
    const newSession: Session = {
      sessionId,
      userId: session.userId,
      refreshTokenHash: await this.tokenProvider.hashToken(
        newTokens.refreshToken,
      ),
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      createdAt: now,
      lastActive: now,
    };
    const refreshTokenPayload: JwtPayload = await this.tokenProvider.decode(
      newTokens.refreshToken,
    );
    await this.sessionRepo.save(
      newSession,
      dfns.differenceInSeconds(refreshTokenPayload.exp * 1000, now),
    );
    return newTokens;
  }
}
