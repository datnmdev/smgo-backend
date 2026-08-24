import { TPaginationResponse } from '@/core/common/pagination.entity';
import { Injectable } from '@nestjs/common';
import { TLocation } from '../entities/location.entity';
import {
  FindLocationsByPhoneAndAddress,
  LocationRepository,
} from '../repositories/location.repository';

@Injectable()
export class GetLocationSuggestionUsecase {
  constructor(private readonly locationRepo: LocationRepository) {}

  execute(
    params: FindLocationsByPhoneAndAddress,
  ): Promise<TPaginationResponse<TLocation>> {
    return this.locationRepo.findByPhoneAndAddress(params);
  }
}
