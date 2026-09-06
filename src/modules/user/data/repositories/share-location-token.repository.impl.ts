import { Injectable } from '@nestjs/common';
import { ShareLocationTokenRepository } from '../../domain/repositories/share-location-token.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { TCoordinate } from '../../domain/entities/location.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@/core/config/config.service';
import { TShareLocationPayload } from '../../domain/entities/share-location.entity';
import { v4 } from 'uuid';
import { ShareLocationTokenKeyNotFoundException } from '../exceptions/share-location-token-key-not-found.exception';

@Injectable()
export class ShareLocationTokenRepositoryImpl implements ShareLocationTokenRepository {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createTokenKey(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderId: string,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        userId,
        deliveryRouteId,
        deliveryOrderId,
      },
      {
        secret: this.configService.getJwtConfig().jwtSecret,
        algorithm: 'HS256',
        expiresIn: '24h',
      },
    );
    const tokenKey = v4();
    await this.redisClient.setex(tokenKey, 24 * 60 * 60, token);
    return tokenKey;
  }

  async verify(tokenKey: string): Promise<TShareLocationPayload> {
    const token = await this.redisClient.get(tokenKey);
    if (!token) {
      throw new ShareLocationTokenKeyNotFoundException();
    }
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getJwtConfig().jwtSecret,
    });
  }

  async saveShareLocation(
    tokenKey: string,
    coordinate: TCoordinate,
  ): Promise<void> {
    await this.redisClient.setex(
      `share-token:${tokenKey}:coordinate`,
      24 * 60 * 60,
      JSON.stringify(coordinate),
    );
  }

  async getShareLocation(tokenKey: string): Promise<TCoordinate | null> {
    const coordinateJson = await this.redisClient.get(
      `share-token:${tokenKey}:coordinate`,
    );
    if (!coordinateJson) {
      return null;
    }
    return JSON.parse(coordinateJson);
  }
}
