import { Injectable } from '@nestjs/common';
import {
  PresignedUploadUrlOptions,
  StorageRepository,
} from '../repositories/storage.repository';
import { MediaRepository } from '../repositories/media.repository';
import { TUploadUrl } from '../entities/upload-url.entity';

@Injectable()
export class GetPresignedUploadUrlUsecase {
  constructor(
    private readonly storageRepo: StorageRepository,
    private readonly mediaRepo: MediaRepository,
  ) {}

  async execute(options: PresignedUploadUrlOptions): Promise<TUploadUrl> {
    const media = await this.mediaRepo.create({
      fikeKey: options.fileKey,
    });
    const presignedUploadUrl =
      await this.storageRepo.getPresignedUploadUrl(options);
    return {
      mediaId: media.id,
      uploadUrl: presignedUploadUrl.replaceAll(
        'http://localhost:9000',
        'https://qkwp9rg7-9000.asse.devtunnels.ms',
      ),
    };
  }
}
