import { SavedLocationModel } from "@/@types/modules/user/domain/models/saved-location";
import { FindSavedLocationsByQuery } from "@/@types/modules/user/domain/repositories/saved-locations";

export abstract class SavedLocationsRepository {
  abstract findByQuery(query?: FindSavedLocationsByQuery): Promise<SavedLocationModel[]>;
}