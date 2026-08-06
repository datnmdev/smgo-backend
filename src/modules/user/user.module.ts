import { Module } from '@nestjs/common';
import { CreateUserUsecase } from './domain/usecases/create-user.usecase';
import { GetUsersByQueryUsecase } from './domain/usecases/get-users-by-query.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './data/storages/postgres/entities/users.entity';
import { SavedLocations } from './data/storages/postgres/entities/saved-locations.entity';
import { getRepositoryToken } from '@/core/decorators/inject-repository.decorator';
import { PostgresUsersRepository } from './data/storages/postgres/repositories/postgres-users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Users, SavedLocations])],
  controllers: [],
  providers: [
    {
      provide: getRepositoryToken(PostgresUsersRepository),
      useClass: PostgresUsersRepository,
    },
    CreateUserUsecase,
    GetUsersByQueryUsecase,
  ],
  exports: [CreateUserUsecase, GetUsersByQueryUsecase],
})
export class UserModule {}
