export interface RouteStopModel {
  id: string;
  orderCode: string;
  orderName: string | null;
  sequenceOrder: number | null;
  status: 'pending' | 'delivered' | 'cancelled';
  contactName: string | null;
  contactPhone: string;
  address: string;
  location: Point | null;
  appliedLocation: string | null;
  routeId: string;
  createdAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  deletedAt: Date | null;
}
