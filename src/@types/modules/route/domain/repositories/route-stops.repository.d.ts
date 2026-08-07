export interface FindRouteStopsByQuery {
  userId?: string;
  id?: string;
  keyword?: string;
  routeId?: string;
  includeDeletedLocation?: boolean;
}

export interface CreateRouteStopData {
  orderMediaId?: string | null;
  orderCode: string;
  orderName?: string | null;
  contactName?: string | null;
  contactPhone: string;
  address: string;
  location?: Point | null;
  appliedLocation?: string | null;
  routeId: string;
}

export interface UpdateRouteStopData {
  orderCode?: string;
  orderName?: string | null;
  sequenceOrder?: number | null;
  status?: 'pending' | 'checked' | 'delivered' | 'cancelled';
  contactName?: string | null;
  contactPhone?: string;
  address?: string;
  location?: Point | null;
  appliedLocation?: string | null;
  routeId?: string;
  updatedAt?: Date;
  checkedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  deletedAt?: Date | null;
}
