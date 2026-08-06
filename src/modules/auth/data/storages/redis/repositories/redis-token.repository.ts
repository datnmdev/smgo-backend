import { TokenRepository } from '@/modules/auth/domain/repositories/token.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisTokenRepository implements TokenRepository {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async addToBlacklist(jti: string, ttl: number): Promise<void> {
    await this.redis.setex(`session:blacklist:${jti}`, ttl, 'true');
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    return Boolean(await this.redis.get(`session:blacklist:${jti}`));
  }
}
