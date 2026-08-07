import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../../domain/services/token-provider.service';
import { JwtPayload, JwtTokens } from '@/@types/jwt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@/core/config/config.service';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';

@Injectable()
export class TokenProviderImpl implements TokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async generateTokens(payload: JwtPayload): Promise<JwtTokens> {
    const jwtid = v4();
    const tokens: JwtTokens = {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.getJwtConfig().jwtSecret,
        algorithm: 'HS256',
        expiresIn: '2d',
        jwtid,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.getJwtConfig().jwtSecret,
        algorithm: 'HS256',
        expiresIn: '30d',
        jwtid,
      }),
    };
    return tokens;
  }

  verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getJwtConfig().jwtSecret,
    });
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  decode(token: string): Promise<JwtPayload> {
    return this.jwtService.decode(token);
  }
}
