import { SavedLocationModel } from "@/@types/modules/user/domain/models/saved-location";
import { FindSavedLocationsByQuery } from "@/@types/modules/user/domain/repositories/saved-locations.repository";
import { Injectable } from "@nestjs/common";
import { SavedLocationsRepository } from "../repositories/saved-locations.repository";

@Injectable()
export class GetSavedLocationsUsecase {
  constructor(
    private readonly savedLocationsRepo: SavedLocationsRepository
  ) {}

  execute(query?: FindSavedLocationsByQuery): Promise<SavedLocationModel[]> {
    return this.savedLocationsRepo.findByQuery(query);
  }
}