import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppVersions } from "./data/storage/postgres/entities/app-versions.entity";
import { AppVersionsRepository } from "./domain/repositories/app-versions.repository";
import { PostgresAppVersionsRepository } from "./data/storage/postgres/repositories/postgres-app-versions.repository";
import { GetLatestAppVersionUsecase } from "./domain/usecases/get-latest-app-version.usecase";
import { AppVersionController } from "./presentation/controllers/app-version.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppVersions
    ])
  ],
  controllers: [
    AppVersionController
  ],
  providers: [
    // Repositories
    {
      provide: AppVersionsRepository,
      useClass: PostgresAppVersionsRepository
    },
    GetLatestAppVersionUsecase
  ]
})
export class AppVersionModule {}