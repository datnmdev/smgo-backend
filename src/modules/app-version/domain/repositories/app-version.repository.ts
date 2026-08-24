import { AppVersion } from '../entities/app-version.entity';

export abstract class AppVersionRepository {
  abstract findByQuery(query: FindAppVersionsByQuery): Promise<AppVersion[]>;
}

export interface FindAppVersionsByQuery {
  id?: string;
  platform?: string;
  versionName?: string;
  buildNumber?: number;
  minSupportedBuild?: number;
  isActive?: boolean;
  storeAppId?: string;
  isMaintenance?: boolean;
}
