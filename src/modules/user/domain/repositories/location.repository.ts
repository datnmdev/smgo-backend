import {
  TPaginationQuery,
  TPaginationResponse,
} from '@/core/common/pagination.entity';
import { TLocation, TPoint } from '../entities/location.entity';

export abstract class LocationRepository {
  abstract findByQuery(
    query?: FindLocationsByQuery,
  ): Promise<TPaginationResponse<TLocation>>;
  abstract findByPhoneAndAddress(
    params: FindLocationsByPhoneAndAddress,
  ): Promise<TPaginationResponse<TLocation>>;
  abstract create(data: CreateLocationData): Promise<TLocation>;
  abstract update(
    locationId: string,
    data: UpdateLocationData,
    manager?: any,
  ): Promise<TLocation>;
}

export interface FindLocationsByQuery extends TPaginationQuery {
  keyword?: string;
  userId?: string;
  id?: string;
  includeDeletedLocation?: boolean;
}

export interface FindLocationsByPhoneAndAddress extends TPaginationQuery {
  contactPhone?: string;
  address?: string;
}

export interface CreateLocationData {
  userId: string;
  locationName: string;
  contactName: string;
  contactPhone: string;
  address: string;
  mediaIds?: string[];
  note?: string | null;
  location?: TPoint;
}

export interface UpdateLocationData {
  name?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  location?: TPoint;
  mediaIds?: string[];
  note?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
