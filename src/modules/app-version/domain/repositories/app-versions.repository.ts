import { AppVersionModel } from "@/@types/modules/app-version/domain/models/app-version.model";
import { FindAppVersionsByQuery } from "@/@types/modules/app-version/domain/repositories/app-version.repository";

export abstract class AppVersionsRepository {
  abstract findByQuery(query: FindAppVersionsByQuery): Promise<AppVersionModel[]>;
}