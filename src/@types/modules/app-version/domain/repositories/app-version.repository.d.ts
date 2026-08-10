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
