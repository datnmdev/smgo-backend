import { Injectable } from '@nestjs/common';
import {
  FindMediaByQuery,
  MediaRepository,
} from '../repositories/media.repository';
import { TMedia } from '../entities/media.entity';

@Injectable()
export class GetMediaUsecase {
  constructor(private readonly mediaRepo: MediaRepository) {}

  execute(findMediaByQuery?: FindMediaByQuery): Promise<TMedia[]> {
    return this.mediaRepo.findByQuery(findMediaByQuery);
  }
}
