import { SavedLocationModel } from '@/@types/modules/user/domain/models/saved-location';
import { SaveLocationData } from '@/@types/modules/user/domain/repositories/saved-locations';
import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';

@Injectable()
export class SaveLocationUsecase {
  constructor(private readonly savedLocationsRepo: SavedLocationsRepository) {}

  execute(userId: string, data: SaveLocationData): Promise<SavedLocationModel> {
    return this.savedLocationsRepo.saveLocation(userId, data);
  }
}
