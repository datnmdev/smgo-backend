export interface FindRoutesByQuery {
  id?: string;
  keyword?: string;
  userId?: string;
  includeDeletedLocation?: boolean;
}

export interface CreateRouteData {
  name: string;
  userId: string;
}

export interface UpdateRouteData {
  name?: string;
  status?: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  updatedAt?: Date;
  deletedAt?: Date | null;
}
