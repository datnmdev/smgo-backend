import { UserModel } from '@/@types/modules/user/domain/models/user';
import { CreateUserData, FindUsersByQuery } from '@/@types/modules/user/domain/repositories/user-repository';

export abstract class UsersRepository {
  abstract create(data: CreateUserData, manager?: any): Promise<UserModel>;
  abstract findByQuery(query?: FindUsersByQuery): Promise<UserModel[]>;
}