import { Injectable } from '@nestjs/common';
import { LocationNotFoundException } from '../exceptions/location-not-found.exception';
import {
  LocationRepository,
  UpdateLocationData,
} from '../repositories/location.repository';

@Injectable()
export class UpdateLocationUsecase {
  constructor(private readonly locationRepo: LocationRepository) {}

  async execute(
    userId: string,
    locationId: string,
    data: UpdateLocationData,
  ): Promise<void> {
    const location = await this.locationRepo.findByQuery({
      userId,
      id: locationId,
    });
    if (!location) {
      throw new LocationNotFoundException();
    }
    await this.locationRepo.update(locationId, data);
  }
}
