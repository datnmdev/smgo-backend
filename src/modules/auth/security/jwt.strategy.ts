import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@/core/config/config.service';
import { Request } from 'express';
import {
  RedisTokenRepository,
  TokenRepository,
} from '../domain/repositories/token.repository';
import { JwtPayload } from '@/@types/jwt';
import { InjectRepository } from '@/core/decorators/inject-repository.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RedisTokenRepository)
    private readonly tokenRepo: TokenRepository,
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
    const isBlacklisted = await this.tokenRepo.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
