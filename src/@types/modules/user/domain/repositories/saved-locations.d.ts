export interface FindSavedLocationsByQuery {
  keyword?: string;
  userId?: string;
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
}
