import { JwtPayload, JwtToken } from '@/@types/jwt';
import { ConfigService } from '@/core/config/config.service';
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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInWithGoogleUsecase {
  constructor(
    private readonly configService: ConfigService,
    private readonly uowService: UnitOfWorkService,
    private readonly getUsersByQuery: GetUsersByQueryUsecase,
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly jwtService: JwtService,
  ) {}

  async execute(idToken: string): Promise<JwtToken> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    return transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        const client = new OAuth2Client(
          this.configService.getGoogleOAuthConfig().clientId,
        );
        const ticket = await client.verifyIdToken({
          idToken,
          audience: this.configService.getGoogleOAuthConfig().clientId,
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
              name: payload.name,
              uuid: payload.sub,
              provider: 'google',
            },
            uowManager.manager,
          );
        }

        // Tạo token
        const jwtPayload: JwtPayload = {
          id: user.id,
        };
        const jwtid = v4();
        const jwtToken: JwtToken = {
          accessToken: await this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.getJwtConfig().jwtSecret,
            algorithm: 'HS256',
            expiresIn: '2d',
            jwtid,
          }),
          refreshToken: await this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.getJwtConfig().jwtSecret,
            algorithm: 'HS256',
            expiresIn: '365d',
            jwtid,
          }),
        };
        await this.uowService.commit();
        return jwtToken;
      } catch (error) {
        await this.uowService.rollback();
        throw error;
      } finally {
        await this.uowService.release();
      }
    });
  }
}
