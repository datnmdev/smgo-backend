export interface AppVersion {
  id: string;
  platform: string;
  versionName: string;
  buildNumber: number;
  minSupportedBuild: number;
  isActive: boolean;
  storeAppId: string;
  releaseNotes: object;
  isMaintenance: boolean;
  maintenanceMessage: object;
  createdAt: Date;
  updatedAt: Date;
}
