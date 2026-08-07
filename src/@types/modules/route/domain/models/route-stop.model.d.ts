export interface RouteStopModel {
  id: string;
  orderMediaId: string | null;
  orderCode: string;
  orderName: string | null;
  sequenceOrder: number | null;
  status: 'pending' | 'checked' | 'delivered' | 'cancelled';
  contactName: string | null;
  contactPhone: string;
  address: string;
  location: Point | null;
  appliedLocation: string | null;
  routeId: string;
  createdAt: Date;
  updatedAt: Date;
  checkedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  deletedAt: Date | null;
}
