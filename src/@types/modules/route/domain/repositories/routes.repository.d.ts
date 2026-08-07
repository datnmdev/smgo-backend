export interface FindRoutesByQuery {
  keyword?: string;
  userId?: string;
  includeDeletedLocation?: boolean;
}

export interface CreateRouteData {
  name: string;
}

export interface UpdateRouteData {
  name?: string;
  deletedAt?: Date;
}
