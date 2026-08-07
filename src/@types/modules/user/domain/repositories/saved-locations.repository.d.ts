export interface FindSavedLocationsByQuery {
  keyword?: string;
  userId?: string;
  includeDeletedLocation?: boolean;
}

export interface SaveLocationData {
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location?: Point;
}

export interface UpdateSavedLocationData {
  name?: string;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  location?: Point;
  deletedAt?: Date;
}
