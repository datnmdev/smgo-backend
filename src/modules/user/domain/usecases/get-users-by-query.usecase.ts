import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { FindUsersByQuery } from '@/@types/modules/user/domain/repositories/user-repository';
import { UserModel } from '@/@types/modules/user/domain/models/user';

@Injectable()
export class GetUsersByQueryUsecase {
  constructor(private readonly usersRepo: UsersRepository) {}

  execute(query: FindUsersByQuery): Promise<UserModel[]> {
    return this.usersRepo.findByQuery(query);
  }
}
