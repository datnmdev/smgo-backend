import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';
import { UpdateSavedLocationData } from '@/@types/modules/user/domain/repositories/saved-locations';
import { SavedLocationModel } from '@/@types/modules/user/domain/models/saved-location';

@Injectable()
export class UpdateSavedLocationUsecase {
  constructor(private readonly savedLocationsRepo: SavedLocationsRepository) {}

  execute(
    userId: string,
    locationId: string,
    data: UpdateSavedLocationData,
  ): Promise<SavedLocationModel> {
    return this.savedLocationsRepo.update(userId, locationId, data);
  }
}
