import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../repositories/storage.repository';
import { MediaRepository } from '../repositories/media.repository';
import { MediaNotFoundException } from '../exceptions/media_not_found.exception';

@Injectable()
export class GetPresignedDownloadUrlUsecase {
  constructor(
    private readonly storageRepo: StorageRepository,
    private readonly mediaRepo: MediaRepository,
  ) {}

  async execute(mediaId: string): Promise<string> {
    const media = (
      await this.mediaRepo.findByQuery({
        ids: [mediaId],
      })
    )?.[0];
    if (!media) {
      throw new MediaNotFoundException();
    }
    const result = await this.storageRepo.getPresignedDownloadUrl({
      fileKey: media.fileKey,
      expiry: 60 * 60,
    });

    return result.replace(
      'http://localhost:9000',
      'https://qkwp9rg7-9000.asse.devtunnels.ms',
    );
  }
}