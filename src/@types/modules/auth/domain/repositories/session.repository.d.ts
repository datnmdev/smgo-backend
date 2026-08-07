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
