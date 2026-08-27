import { TMedia } from "../entities/media.entity";

export abstract class MediaRepository {
  abstract findByQuery(query?: FindMediaByQuery): Promise<TMedia[]>;
  abstract create(data: CreateMediaData): Promise<TMedia>;
  abstract attachMedia(mediaIds: string[]): Promise<void>;
}

export interface CreateMediaData {
  fileKey: string;
}

export interface FindMediaByQuery {
  ids?: string[];
}