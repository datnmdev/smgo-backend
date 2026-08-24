import { Injectable } from '@nestjs/common';
import {
  FindLocationsByQuery,
  LocationRepository,
} from '../repositories/location.repository';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TLocation } from '../entities/location.entity';
import { GetMediaUsecase } from '@/modules/storage/domain/usecases/get-media.usecase';
import { GetPresignedDownloadUrlUsecase } from '@/modules/storage/domain/usecases/get-presigned-download-url.usecase';

@Injectable()
export class GetLocationsUsecase {
  constructor(
    private readonly locationRepo: LocationRepository,
    private readonly getMediaUsecase: GetMediaUsecase,
    private readonly getPresignedDownloadUrlUsecase: GetPresignedDownloadUrlUsecase,
  ) {}

  async execute(
    query?: FindLocationsByQuery,
  ): Promise<TPaginationResponse<TLocationWithMedia>> {
    const locations = (await this.locationRepo.findByQuery(
      query,
    )) as TPaginationResponse<TLocationWithMedia>;
    locations.data = await Promise.all(
      locations.data.map(async (location) => ({
        ...location,
        media: await Promise.all(
          (
            await this.getMediaUsecase.execute({
              ids: location.mediaIds,
            })
          ).map(async (media) => {
            let url = '';
            try {
              url = await this.getPresignedDownloadUrlUsecase.execute(media.id);
            } catch {}
            return {
              id: media.id,
              url,
            };
          }),
        ),
      })),
    );
    return locations;
  }
}

export type TLocationWithMedia = TLocation & {
  media: Array<{ id: string; url: string }>;
};
