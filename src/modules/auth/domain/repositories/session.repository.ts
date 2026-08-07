import { Session } from '@/@types/modules/auth/domain/repositories/session.repository';

export abstract class SessionRepository {
  abstract save(session: Session, ttlInSeconds: number): Promise<void>;
  abstract findByIdAndUserId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null>;
  abstract delete(userId: string, sessionId: string): Promise<void>;
}
