export class SavedLocationModel {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string | object | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
