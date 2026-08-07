export interface Point {
  x: number;
  y: number;
}

export interface SavedLocationModel {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: Point | null;
  userId: string;
  mediaIds: string[];
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
