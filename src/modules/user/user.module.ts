import { Module } from '@nestjs/common';
import { CreateUserUsecase } from './domain/usecases/create-user.usecase';
import { GetUsersByQueryUsecase } from './domain/usecases/get-users-by-query.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './data/storages/postgres/entities/users.entity';
import { SavedLocations } from './data/storages/postgres/entities/saved-locations.entity';
import { PostgresUsersRepository } from './data/storages/postgres/repositories/postgres-users.repository';
import { UsersRepository } from './domain/repositories/users.repository';
import { UserController } from './presentation/controllers/user.controller';
import { SavedLocationsRepository } from './domain/repositories/saved-locations.repository';
import { PostgresSavedLocationsRepository } from './data/storages/postgres/repositories/postgres-saved-locations.repository';
import { GetSavedLocationsUsecase } from './domain/usecases/get-saved-locations.usecase';
import { SaveLocationUsecase } from './domain/usecases/save-location.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Users, SavedLocations])],
  controllers: [UserController],
  providers: [
    {
      provide: UsersRepository,
      useClass: PostgresUsersRepository,
    },
    {
      provide: SavedLocationsRepository,
      useClass: PostgresSavedLocationsRepository,
    },
    CreateUserUsecase,
    GetUsersByQueryUsecase,
    GetSavedLocationsUsecase,
    SaveLocationUsecase
  ],
  exports: [CreateUserUsecase, GetUsersByQueryUsecase],
})
export class UserModule {}
