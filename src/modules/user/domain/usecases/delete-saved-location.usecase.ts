import { Injectable } from '@nestjs/common';
import { SavedLocationsRepository } from '../repositories/saved-locations.repository';

@Injectable()
export class DeleteSavedLocationUsecase {
  constructor(private readonly savedLocationsRepo: SavedLocationsRepository) {}

  async execute(userId: string, locationId: string): Promise<void> {
    await this.savedLocationsRepo.update(userId, locationId, {
      deletedAt: new Date(),
    });
  }
}
