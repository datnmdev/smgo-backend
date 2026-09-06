import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateUserData,
  FindUsersByQuery,
  UpdateProfileData,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { UserModel } from '../models/user.model';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly usersRepo: Repository<UserModel>,
  ) {}

  create(data: CreateUserData, manager?: any): Promise<UserModel> {
    const repo: Repository<UserModel> = !!manager
      ? manager.manager.getRepository(UserModel)
      : this.usersRepo;
    return repo.save(repo.create(data));
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

  async update(userId: string, data: UpdateProfileData): Promise<void> {
    await this.usersRepo.save(
      this.usersRepo.create({
        ...data,
        id: userId,
      }),
    );
  }
}
