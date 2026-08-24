export abstract class StorageRepository {
  abstract getPresignedUploadUrl(
    options: PresignedUploadUrlOptions,
  ): Promise<string>;
  abstract getPresignedDownloadUrl(
    options: PresignedDownloadUrlOptions,
  ): Promise<string>;
}

export interface PresignedUploadUrlOptions {
  fileKey: string;
  expiry: number;
}

export interface PresignedDownloadUrlOptions {
  fileKey: string;
  expiry: number;
}
