import { Injectable } from '@nestjs/common';
import {
  CreateUserData,
  UserRepository,
} from '../repositories/user.repository';
import { TUser } from '../entities/user.entity';

@Injectable()
export class CreateUserUsecase {
  constructor(private readonly usersRepo: UserRepository) {}

  execute(data: CreateUserData, manager?: any): Promise<TUser> {
    return this.usersRepo.create(data, manager);
  }
}
