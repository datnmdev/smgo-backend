import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';
import { LocationNotFoundException } from '../exceptions/location-not-found.exception';

@Injectable()
export class DeleteSavedLocationUsecase {
  constructor(private readonly savedLocationsRepo: SavedLocationsRepository) {}

  async execute(userId: string, savedLocationId: string): Promise<void> {
    const savedLocation = await this.savedLocationsRepo.findByQuery({
      userId,
      id: savedLocationId,
    });
    if (!savedLocation) {
      throw new LocationNotFoundException();
    }
    await this.savedLocationsRepo.update(savedLocationId, {
      deletedAt: new Date(),
    });
  }
}
