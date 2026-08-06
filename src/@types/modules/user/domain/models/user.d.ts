export interface UserModel {
  id: string;
  name: string;
  uuid: string | null;
  provider: 'google' | 'facebook' | null;
  createdAt: Date;
}
