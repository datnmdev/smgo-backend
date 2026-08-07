import { SavedLocationModel } from '@/@types/modules/user/domain/models/saved-location';
import {
  FindSavedLocationsByQuery,
  SaveLocationData,
  UpdateSavedLocationData,
} from '@/@types/modules/user/domain/repositories/saved-locations';

export abstract class SavedLocationsRepository {
  abstract findByQuery(
    query?: FindSavedLocationsByQuery,
  ): Promise<SavedLocationModel[]>;
  abstract create(
    userId: string,
    data: SaveLocationData,
  ): Promise<SavedLocationModel>;
  abstract update(
    userId: string,
    locationId: string,
    data: UpdateSavedLocationData,
  ): Promise<SavedLocationModel>;
}
