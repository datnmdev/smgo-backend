export interface RouteModel {
  id: string;
  name: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
