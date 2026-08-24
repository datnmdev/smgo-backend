export interface TUser {
  id: string;
  name: string;
  uuid: string | null;
  provider: 'google' | 'facebook' | null;
  createdAt: Date;
}
