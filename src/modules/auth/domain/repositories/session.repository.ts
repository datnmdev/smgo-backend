export abstract class SessionRepository {
  abstract save(session: Session, ttlInSeconds: number): Promise<void>;
  abstract findByIdAndUserId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null>;
  abstract delete(userId: string, sessionId: string): Promise<void>;
}

export interface Session {
  sessionId: string;
  userId: string;
  refreshTokenHash: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActive: number;
}

export interface DeviceInfo {
  ip: string;
  userAgent: string;
}