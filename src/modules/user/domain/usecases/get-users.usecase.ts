import { Injectable } from '@nestjs/common';
import {
  FindUsersByQuery,
  UserRepository,
} from '../repositories/user.repository';
import { TUser } from '../entities/user.entity';

@Injectable()
export class GetUsersUsecase {
  constructor(private readonly userRepo: UserRepository) {}

  execute(query: FindUsersByQuery): Promise<TUser[]> {
    return this.userRepo.findByQuery(query);
  }
}
