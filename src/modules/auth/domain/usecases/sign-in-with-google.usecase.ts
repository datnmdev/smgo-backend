import { JwtPayload, JwtTokens } from '@/@types/jwt';
import { ORMType } from '@/core/enum/unit-of-work.enum';
import {
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { CreateUserUsecase } from '@/modules/user/domain/usecases/create-user.usecase';
import { GetUsersByQueryUsecase } from '@/modules/user/domain/usecases/get-users-by-query.usecase';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { v4 } from 'uuid';
import { InvalidGoogleTokenException } from '../exceptions/invalid-google-token.exception';
import { ConfigService } from '@/core/config/config.service';
import { TokenProvider } from '../services/token-provider.service';
import {
  DeviceInfo,
  Session,
} from '@/@types/modules/auth/domain/repositories/session.repository';
import { SessionRepository } from '../repositories/session.repository';
import dfns from 'date-fns';

@Injectable()
export class SignInWithGoogleUsecase {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly getUsersByQuery: GetUsersByQueryUsecase,
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly configService: ConfigService,
    private readonly tokenProvider: TokenProvider,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(idToken: string, deviceInfo: DeviceInfo): Promise<JwtTokens> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    return transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        const client = new OAuth2Client(
          this.configService.getGoogleOAuthConfig().clientId,
        );
        const ticket = await client.verifyIdToken({
          idToken,
          audience: [this.configService.getGoogleOAuthConfig().clientId],
        });
        const payload = ticket.getPayload();

        // Tạo tài khoản mới nếu chưa đăng nhập lần nào
        let user = (
          await this.getUsersByQuery.execute({
            provider: 'google',
            uuid: payload.sub,
          })
        )?.[0];
        if (!user) {
          user = await this.createUserUsecase.execute(
            {
              name: payload.family_name + ' ' + payload.given_name,
              uuid: payload.sub,
              provider: 'google',
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
        throw new InvalidGoogleTokenException();
      } finally {
        await this.uowService.release();
      }
    });
  }
}
