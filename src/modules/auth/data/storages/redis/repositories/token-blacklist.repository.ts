import { TokenBlacklistRepository } from '@/modules/auth/domain/repositories/token-blacklist.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisTokenBlacklistRepository implements TokenBlacklistRepository {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async add(jti: string, ttlInSeconds: number): Promise<void> {
    await this.redis.setex(
      `blacklist:access_token:${jti}`,
      ttlInSeconds,
      'true',
    );
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.exists(`blacklist:access_token:${jti}`);
    return result === 1;
  }
}
