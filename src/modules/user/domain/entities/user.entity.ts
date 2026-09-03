export interface TUser {
  id: string;
  name: string;
  uuid: string | null;
  provider: 'google' | 'facebook' | null;
  avatar: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}
