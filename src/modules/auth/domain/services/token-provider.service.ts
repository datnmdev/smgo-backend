import { JwtPayload, JwtTokens } from '@/@types/jwt';

export abstract class TokenProvider {
  abstract generateTokens(payload: JwtPayload): Promise<JwtTokens>;
  abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
  abstract hashToken(token: string): Promise<string>;
  abstract decode(token: string): Promise<JwtPayload>;
}
