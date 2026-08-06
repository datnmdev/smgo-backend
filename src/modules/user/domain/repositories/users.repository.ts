import { UserModel } from '@/@types/modules/user/domain/models/user';
import { CreateUserData, FindUsersByQuery } from '@/@types/modules/user/domain/repositories/user-repository';

export interface UsersRepository {
  create(data: CreateUserData, manager?: any): Promise<UserModel>;
  findByQuery(query?: FindUsersByQuery): Promise<UserModel[]>;
}

export abstract class PostgresUsersRepository {}
