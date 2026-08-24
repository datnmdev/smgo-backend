import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetLatestAppVersionUsecase } from './domain/usecases/get-latest-app-version.usecase';
import { AppVersionController } from './presentation/controllers/app-version.controller';
import { AppVersionRepository } from './domain/repositories/app-version.repository';
import { AppVersionRepositoryImpl } from './data/repositories/app-version.repository.impl';
import { AppVersionModel } from './data/models/app-version.model';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersionModel])],
  controllers: [AppVersionController],
  providers: [
    // Repositories
    {
      provide: AppVersionRepository,
      useClass: AppVersionRepositoryImpl,
    },
    GetLatestAppVersionUsecase,
  ],
})
export class AppVersionModule {}
