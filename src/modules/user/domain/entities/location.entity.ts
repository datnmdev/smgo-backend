export interface TPoint {
  x: number;
  y: number;
}

export interface TLocation {
  id: string;
  locationName: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: TPoint;
  userId: string;
  mediaIds: string[];
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TCoordinate {
  lat: number;
  lng: number;
}