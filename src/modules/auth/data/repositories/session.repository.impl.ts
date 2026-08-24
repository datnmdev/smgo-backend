import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  Session,
  SessionRepository,
} from '@/modules/auth/domain/repositories/session.repository';

@Injectable()
export class SessionRepositoryImpl implements SessionRepository {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async save(session: Session, ttlInSeconds: number): Promise<void> {
    const setName = `user:${session.userId}:sessions`;
    const pipeline = this.redis.pipeline();
    pipeline.hset(setName, session.sessionId, JSON.stringify(session));
    pipeline.call(
      'HEXPIRE',
      setName,
      ttlInSeconds,
      'FIELDS',
      1,
      session.sessionId,
    );
    await pipeline.exec();
  }

  async findByIdAndUserId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null> {
    const setName = `user:${userId}:sessions`;
    const data = await this.redis.hget(setName, sessionId);
    if (!data) return null;
    return JSON.parse(data);
  }

  async delete(userId: string, sessionId: string): Promise<void> {
    const setName = `user:${userId}:sessions`;
    await this.redis.hdel(setName, sessionId);
  }
}
