import { Module } from '@nestjs/common';
import { StorageRepository } from './domain/repositories/storage.repository';
import { ConfigModule } from '@/core/config/config.module';
import { StorageController } from './presentation/controllers/storage.controller';
import { GetPresignedUploadUrlUsecase } from './domain/usecases/get-presigned-upload-url.usecase';
import { GetPresignedDownloadUrlUsecase } from './domain/usecases/get-presigned-download-url.usecase';
import { MediaRepository } from './domain/repositories/media.repository';
import { MediaRepositoryImpl } from './data/repositories/media.repository.impl';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachMediaUsecase } from './domain/usecases/attach-media.usecase';
import { GetMediaUsecase } from './domain/usecases/get-media.usecase';
import { MediaModel } from './data/models/media.model';
import { R2StorageRepositoryImpl } from './data/repositories/r2-storage.repository.impl';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaModel])],
  controllers: [StorageController],
  providers: [
    // Repositories
    {
      provide: StorageRepository,
      useClass: R2StorageRepositoryImpl,
    },
    {
      provide: MediaRepository,
      useClass: MediaRepositoryImpl,
    },

    // Usecases
    GetPresignedUploadUrlUsecase,
    GetPresignedDownloadUrlUsecase,
    AttachMediaUsecase,
    GetMediaUsecase,
  ],
  exports: [AttachMediaUsecase, GetMediaUsecase, GetPresignedDownloadUrlUsecase,],
})
export class StorageModule {}
