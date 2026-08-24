import { Injectable } from '@nestjs/common';
import { NestMinioService } from 'nestjs-minio';
import { ConfigService } from '@/core/config/config.service';
import { PresignedDownloadUrlOptions, PresignedUploadUrlOptions, StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable()
export class StorageRepositoryImpl implements StorageRepository {
  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: NestMinioService,
  ) {}

  async getPresignedUploadUrl(
    options: PresignedUploadUrlOptions,
  ): Promise<string> {
    const bucket = this.configService.getMinioConfig().bucket;
    const exists = await this.minioService.getMinio().bucketExists(bucket);
    if (!exists) {
      await this.minioService.getMinio().makeBucket(bucket);
    }
    return this.minioService
      .getMinio()
      .presignedPutObject(bucket, options.fileKey, options.expiry);
  }

  async getPresignedDownloadUrl(
    options: PresignedDownloadUrlOptions,
  ): Promise<string> {
    const bucket = this.configService.getMinioConfig().bucket;
    const exists = await this.minioService.getMinio().bucketExists(bucket);
    if (!exists) {
      await this.minioService.getMinio().makeBucket(bucket);
    }
    return this.minioService
      .getMinio()
      .presignedGetObject(bucket, options.fileKey, options.expiry);
  }
}