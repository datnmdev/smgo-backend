export abstract class TokenBlacklistRepository {
  abstract add(sessionId: string, ttlInSeconds: number): Promise<void>;
  abstract isBlacklisted(sessionId: string): Promise<boolean>;
}