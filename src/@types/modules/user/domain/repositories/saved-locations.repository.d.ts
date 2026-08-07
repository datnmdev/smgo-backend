export interface FindSavedLocationsByQuery {
  keyword?: string;
  userId?: string;
  id?: string;
  includeDeletedLocation?: boolean;
}

export interface SaveLocationData {
  userId: string;
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  mediaIds?: string[];
  note?: string | null;
  location?: Point;
}

export interface UpdateSavedLocationData {
  name?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  location?: Point;
  mediaIds?: string[];
  note?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
