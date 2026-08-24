import { TokenBlacklistRepository } from '@/modules/auth/domain/repositories/token-blacklist.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistRepositoryImpl implements TokenBlacklistRepository {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async add(sessionId: string, ttlInSeconds: number): Promise<void> {
    await this.redis.setex(
      `blacklist:access_token:${sessionId}`,
      ttlInSeconds,
      'true',
    );
  }

  async isBlacklisted(sessionId: string): Promise<boolean> {
    const result = await this.redis.exists(
      `blacklist:access_token:${sessionId}`,
    );
    return result === 1;
  }
}
