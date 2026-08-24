import { Injectable } from '@nestjs/common';
import { LocationNotFoundException } from '../exceptions/location-not-found.exception';
import { LocationRepository } from '../repositories/location.repository';

@Injectable()
export class DeleteLocationUsecase {
  constructor(private readonly locationRepo: LocationRepository) {}

  async execute(userId: string, locationId: string): Promise<void> {
    const Location = await this.locationRepo.findByQuery({
      userId,
      id: locationId,
    });
    if (!Location) {
      throw new LocationNotFoundException();
    }
    await this.locationRepo.update(locationId, {
      deletedAt: new Date(),
    });
  }
}
