export interface CreateUserData {
  name: string;
  uuid: string;
  provider: 'google' | 'facebook';
}

export interface FindUsersByQuery {
  id?: string;
  uuid?: string | null;
  provider?: 'google' | 'facebook' | null;
}
