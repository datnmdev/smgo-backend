import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';
import { UpdateSavedLocationData } from '@/@types/modules/user/domain/repositories/saved-locations.repository';
import { LocationNotFoundException } from '../exceptions/location-not-found.exception';

@Injectable()
export class UpdateSavedLocationUsecase {
  constructor(
    private readonly savedLocationsRepo: SavedLocationsRepository
  ) {}

  async execute(
    userId: string,
    savedLocationId: string,
    data: UpdateSavedLocationData,
  ): Promise<void> {
    const savedLocation = await this.savedLocationsRepo.findByQuery({
      userId,
      id: savedLocationId,
    });
    if (!savedLocation) {
      throw new LocationNotFoundException();
    }
    await this.savedLocationsRepo.update(savedLocationId, data);
  }
}
