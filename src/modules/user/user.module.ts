import { forwardRef, Module } from '@nestjs/common';
import { CreateUserUsecase } from './domain/usecases/create-user.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './presentation/controllers/user.controller';
import { LocationRepository } from './domain/repositories/location.repository';
import { StorageModule } from '../storage/storage.module';
import { UserModel } from './data/models/user.model';
import { LocationModel } from './data/models/location.model';
import { UserRepository } from './domain/repositories/user.repository';
import { UserRepositoryImpl } from './data/repositories/user.repository.impl';
import { LocationRepositoryImpl } from './data/repositories/location.repository.impl';
import { GetUsersUsecase } from './domain/usecases/get-users.usecase';
import { GetLocationsUsecase } from './domain/usecases/get-locations.usecase';
import { CreateLocationUsecase } from './domain/usecases/create-location.usecase';
import { UpdateLocationUsecase } from './domain/usecases/update-location.usecase';
import { DeleteLocationUsecase } from './domain/usecases/delete-location.usecase';
import { LocationController } from './presentation/controllers/location.controller';
import { GetLocationSuggestionUsecase } from './domain/usecases/get-location-sugesstions.usecase';
import { DeleteLocationsUsecase } from './domain/usecases/delete-locations.usecase';
import { UnitOfWorkModule } from '@/core/unit-of-work/unit-of-work.module';
import { PaymentModule } from '../payment/payment.module';
import { UpdateProfileUsecase } from './domain/usecases/update-profile.usecase';
import { GetShareLocationUrlUsecase } from './domain/usecases/get-share-location-url.usecase';
import { GetShareLocationUsecase } from './domain/usecases/get-share-location.usecase';
import { SaveShareLocationUsecase } from './domain/usecases/save-share-location.usecase';
import { CheckShareLocationTokenUsecase } from './domain/usecases/check-share-location-token.usecase';
import { ShareLocationTokenRepository } from './domain/repositories/share-location-token.repository';
import { ShareLocationTokenRepositoryImpl } from './data/repositories/share-location-token.repository.impl';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@/core/config/config.module';
import { DeliveryRouteModule } from '../delivery-route/delivery-route.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, LocationModel]),
    StorageModule,
    UnitOfWorkModule,
    PaymentModule,
    JwtModule,
    ConfigModule,
    forwardRef(() => DeliveryRouteModule),
  ],
  controllers: [UserController, LocationController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: LocationRepository,
      useClass: LocationRepositoryImpl,
    },
    {
      provide: ShareLocationTokenRepository,
      useClass: ShareLocationTokenRepositoryImpl,
    },
    CreateUserUsecase,
    GetUsersUsecase,
    GetLocationsUsecase,
    CreateLocationUsecase,
    UpdateLocationUsecase,
    DeleteLocationUsecase,
    DeleteLocationsUsecase,
    GetLocationSuggestionUsecase,
    UpdateProfileUsecase,
    GetShareLocationUrlUsecase,
    GetShareLocationUsecase,
    SaveShareLocationUsecase,
    CheckShareLocationTokenUsecase,
  ],
  exports: [CreateUserUsecase, GetUsersUsecase, GetLocationsUsecase],
})
export class UserModule {}
