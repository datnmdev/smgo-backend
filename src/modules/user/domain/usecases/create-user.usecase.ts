import { UserModel } from '@/@types/modules/user/domain/models/user';
import { CreateUserData } from '@/@types/modules/user/domain/repositories/users.repository';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class CreateUserUsecase {
  constructor(private readonly usersRepo: UsersRepository) {}

  execute(data: CreateUserData, manager?: any): Promise<UserModel> {
    return this.usersRepo.create(data, manager);
  }
}
