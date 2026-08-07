import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@/core/config/config.service';
import { Request } from 'express';
import { JwtPayload } from '@/@types/jwt';
import { IsBlacklistedUsecase } from '../domain/usecases/is-blacklisted.usecase';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly isBlacklistedUsecase: IsBlacklistedUsecase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          const token = request.query?.token as string;
          return token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtConfig().jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const isBlacklisted = await this.isBlacklistedUsecase.execute(
      payload.sessionId,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
