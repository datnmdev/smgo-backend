export type DeliveryOrderStatus =
  'pending' | 'checked' | 'sorted' | 'delivered' | 'cancelled' | 'rescheduled';

export interface TPoint {
  x: number;
  y: number;
}

export interface TDeliveryOrder {
  id: string;
  orderMediaId: string | null;
  orderCode: string;
  orderName: string | null;
  sequenceOrder: number | null;
  status: DeliveryOrderStatus;
  contactName: string | null;
  contactPhone: string;
  address: string;
  location: TPoint;
  appliedLocationId: string | null;
  deliveryRouteId: string;
  createdAt: Date;
  updatedAt: Date;
  checkedAt: Date | null;
  sortedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  rescheduledAt: Date | null;
  deletedAt: Date | null;
}
