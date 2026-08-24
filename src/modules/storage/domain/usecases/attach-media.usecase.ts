import { Injectable } from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';

@Injectable()
export class AttachMediaUsecase {
  constructor(private readonly mediaRepo: MediaRepository) {}

  async execute(mediaIds: string[]): Promise<void> {
    await this.mediaRepo.attachMedia(mediaIds);
  }
}
