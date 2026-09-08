import { Injectable } from '@nestjs/common';
import {
  PresignedUploadUrlOptions,
  StorageRepository,
} from '../repositories/storage.repository';
import { MediaRepository } from '../repositories/media.repository';
import { TUploadUrl } from '../entities/upload-url.entity';
import { v4 } from 'uuid';

@Injectable()
export class GetPresignedUploadUrlUsecase {
  constructor(
    private readonly storageRepo: StorageRepository,
    private readonly mediaRepo: MediaRepository,
  ) {}

  async execute(): Promise<TUploadUrl> {
    const fileKey = v4();
    const media = await this.mediaRepo.create({
      fileKey,
    });
    const presignedUploadUrl = await this.storageRepo.getPresignedUploadUrl({
      fileKey,
      expiry: 15 * 60,
    });
    return {
      mediaId: media.id,
      uploadUrl: presignedUploadUrl,
    };
  }
}
