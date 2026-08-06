export interface TokenRepository {
  addToBlacklist(jti: string, ttl: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
}

export abstract class RedisTokenRepository {}
