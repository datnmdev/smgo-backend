import { UserModel } from '@/@types/modules/user/domain/models/user';
import { CreateUserData } from '@/@types/modules/user/domain/repositories/user-repository';
import { Injectable } from '@nestjs/common';
import {
  PostgresUsersRepository,
  UsersRepository,
} from '../repositories/users.repository';
import { InjectRepository } from '@/core/decorators/inject-repository.decorator';

@Injectable()
export class CreateUserUsecase {
  constructor(
    @InjectRepository(PostgresUsersRepository)
    private readonly usersRepo: UsersRepository,
  ) {}

  execute(data: CreateUserData, manager?: any): Promise<UserModel> {
    return this.usersRepo.create(data, manager);
  }
}
