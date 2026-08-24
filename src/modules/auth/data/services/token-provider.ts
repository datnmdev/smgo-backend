import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../../domain/services/token-provider.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@/core/config/config.service';
import bcrypt from 'bcrypt';
import { JwtPayload, JwtTokens } from '@/core/security/jwt.strategy';

@Injectable()
export class TokenProviderImpl implements TokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async generateTokens(payload: JwtPayload): Promise<JwtTokens> {
    const tokens: JwtTokens = {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.getJwtConfig().jwtSecret,
        algorithm: 'HS256',
        expiresIn: '2d',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.getJwtConfig().jwtSecret,
        algorithm: 'HS256',
        expiresIn: '30d',
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
