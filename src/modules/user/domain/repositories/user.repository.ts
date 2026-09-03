import { TUser } from '../entities/user.entity';

export abstract class UserRepository {
  abstract create(data: CreateUserData, manager?: any): Promise<TUser>;
  abstract findByQuery(query?: FindUsersByQuery): Promise<TUser[]>;
}

export interface CreateUserData {
  name: string;
  uuid: string;
  provider: 'google' | 'facebook';
  avatar?: string | null;
}

export interface FindUsersByQuery {
  id?: string;
  uuid?: string | null;
  provider?: 'google' | 'facebook' | null;
}
