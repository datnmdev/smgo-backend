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
  deletedAt?: Date;
}
