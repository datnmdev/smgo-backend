import { JwtPayload, JwtTokens } from '@/@types/jwt';
import { ConfigService } from '@/core/config/config.service';
import { ORMType } from '@/core/enum/unit-of-work.enum';
import {
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { CreateUserUsecase } from '@/modules/user/domain/usecases/create-user.usecase';
import { GetUsersByQueryUsecase } from '@/modules/user/domain/usecases/get-users-by-query.usecase';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import ky from 'ky';
import { InvalidFacebookTokenException } from '../exceptions/invalid-facebook-token.exception';
import { TokenProvider } from '../services/token-provider.service';
import { SessionRepository } from '../repositories/session.repository';
import {
  DeviceInfo,
  Session,
} from '@/@types/modules/auth/domain/repositories/session.repository';
import dfns from 'date-fns';

@Injectable()
export class SignInWithFacebookUsecase {
  constructor(
    private readonly configService: ConfigService,
    private readonly uowService: UnitOfWorkService,
    private readonly getUsersByQuery: GetUsersByQueryUsecase,
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly tokenProvider: TokenProvider,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(
    inputToken: string,
    deviceInfo: DeviceInfo,
  ): Promise<JwtTokens> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    return transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        // Validate token
        const appToken = [
          this.configService.getFacebookOAuthConfig().appId,
          this.configService.getFacebookOAuthConfig().appSecret,
        ].join('|');
        const debugRes = await ky
          .get('https://graph.facebook.com/debug_token', {
            searchParams: {
              input_token: inputToken,
              access_token: appToken,
            },
          })
          .json<any>();        
        if (!debugRes?.data?.is_valid) {
          throw new InvalidFacebookTokenException();
        }
        if (
          debugRes.data.app_id !==
          this.configService.getFacebookOAuthConfig().appId
        ) {
          throw new InvalidFacebookTokenException();
        }
        const profile = await ky
          .get('https://graph.facebook.com/me', {
            searchParams: {
              fields: 'id,name,picture',
            },
            headers: {
              Authorization: `Bearer ${inputToken}`,
            },
          })
          .json<any>();

        // Tạo tài khoản mới nếu chưa đăng nhập lần nào
        let user = (
          await this.getUsersByQuery.execute({
            provider: 'facebook',
            uuid: profile.id,
          })
        )?.[0];
        if (!user) {
          user = await this.createUserUsecase.execute(
            {
              name: profile.name,
              uuid: profile.id,
              provider: 'facebook',
            },
            uowManager.manager,
          );
        }

        // Tạo token
        const sessionId = v4();
        const tokenPayload: JwtPayload = {
          userId: user.id,
          sessionId,
        };
        const tokens = await this.tokenProvider.generateTokens(tokenPayload);

        // Lưu session
        const now = Date.now();
        const session: Session = {
          sessionId,
          userId: user.id,
          refreshTokenHash: await this.tokenProvider.hashToken(
            tokens.refreshToken,
          ),
          ip: deviceInfo.ip,
          userAgent: deviceInfo.userAgent,
          createdAt: now,
          lastActive: now,
        };
        const refreshTokenPayload: JwtPayload = await this.tokenProvider.decode(
          tokens.refreshToken,
        );
        await this.sessionRepo.save(
          session,
          dfns.differenceInSeconds(refreshTokenPayload.exp * 1000, now),
        );
        await this.uowService.commit();
        return tokens;
      } catch (error) {        
        await this.uowService.rollback();
        throw new InvalidFacebookTokenException();
      } finally {
        await this.uowService.release();
      }
    });
  }
}
