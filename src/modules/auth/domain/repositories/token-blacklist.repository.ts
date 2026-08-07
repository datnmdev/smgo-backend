export abstract class TokenBlacklistRepository {
  abstract add(jti: string, ttlInSeconds: number): Promise<void>;
  abstract isBlacklisted(jti: string): Promise<boolean>;
}