import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/users.entity';
import { Brackets, Repository } from 'typeorm';
import { UserModel } from '@/@types/modules/user/domain/models/user';
import {
  CreateUserData,
  FindUsersByQuery,
} from '@/@types/modules/user/domain/repositories/users-repository';
import { UsersRepository } from '@/modules/user/domain/repositories/users.repository';

@Injectable()
export class PostgresUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  create(data: CreateUserData, manager?: any): Promise<UserModel> {
    const repo: Repository<Users> = !!manager
      ? manager.manager.getRepository(Users)
      : this.usersRepo;
    return this.usersRepo.save(this.usersRepo.create(data));
  }

  findByQuery(query?: FindUsersByQuery): Promise<UserModel[]> {
    return this.usersRepo
      .createQueryBuilder('users')
      .where(
        new Brackets((qb) => {
          if (typeof query?.id === 'string') {
            qb.andWhere('users.id = :id', {
              id: query.id,
            });
          }
          if (typeof query?.uuid === 'string') {
            qb.andWhere('users.uuid = :uuid', {
              uuid: query.uuid,
            });
          }
          if (typeof query?.provider === 'string') {
            qb.andWhere('users.provider = :provider', {
              provider: query.provider,
            });
          }
        }),
      )
      .getMany();
  }
}
