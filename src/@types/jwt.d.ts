export interface JwtPayload {
  id: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
