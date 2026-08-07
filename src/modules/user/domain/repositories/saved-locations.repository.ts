import { SavedLocationModel } from '@/@types/modules/user/domain/models/saved-location';
import {
  FindSavedLocationsByQuery,
  SaveLocationData,
} from '@/@types/modules/user/domain/repositories/saved-locations';

export abstract class SavedLocationsRepository {
  abstract findByQuery(
    query?: FindSavedLocationsByQuery,
  ): Promise<SavedLocationModel[]>;
  abstract saveLocation(
    userId: string,
    data: SaveLocationData,
  ): Promise<SavedLocationModel>;
}
