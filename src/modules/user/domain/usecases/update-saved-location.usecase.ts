import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';
import { UpdateSavedLocationData } from '@/@types/modules/user/domain/repositories/saved-locations.repository';

@Injectable()
export class UpdateSavedLocationUsecase {
  constructor(private readonly savedLocationsRepo: SavedLocationsRepository) {}

  async execute(
    userId: string,
    locationId: string,
    data: UpdateSavedLocationData,
  ): Promise<void> {
    await this.savedLocationsRepo.update(userId, locationId, data);
  }
}
