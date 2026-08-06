import { InjectRepository } from '@/core/decorators/inject-repository.decorator';
import { Injectable } from '@nestjs/common';
import {
  PostgresUsersRepository,
  UsersRepository,
} from '../repositories/users.repository';
import { FindUsersByQuery } from '@/@types/modules/user/domain/repositories/user-repository';
import { UserModel } from '@/@types/modules/user/domain/models/user';

@Injectable()
export class GetUsersByQueryUsecase {
  constructor(
    @InjectRepository(PostgresUsersRepository)
    private readonly usersRepo: UsersRepository,
  ) {}

  execute(query: FindUsersByQuery): Promise<UserModel[]> {
    return this.usersRepo.findByQuery(query);
  }
}
