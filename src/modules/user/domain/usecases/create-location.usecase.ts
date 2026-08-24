import { Injectable } from '@nestjs/common';
import { AttachMediaUsecase } from '@/modules/storage/domain/usecases/attach-media.usecase';
import {
  CreateLocationData,
  LocationRepository,
} from '../repositories/location.repository';
import { TLocation } from '../entities/location.entity';

@Injectable()
export class CreateLocationUsecase {
  constructor(
    private readonly savedLocationsRepo: LocationRepository,
    private readonly attachMediaUsecase: AttachMediaUsecase,
  ) {}

  async execute(data: CreateLocationData): Promise<TLocation> {
    await this.attachMediaUsecase.execute(data.mediaIds);
    return this.savedLocationsRepo.create(data);
  }
}
