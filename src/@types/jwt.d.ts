export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

export interface JwtToken {
  accessToken: string;
  refreshToken: string;
}