import {
  DeliveryOrderStatus,
  TDeliveryOrder,
  TPoint,
} from '../entities/delivery-order.entity';

export abstract class DeliveryOrderRepository {
  abstract findByQuery(
    query?: FindDeliveryOrdersByQuery,
  ): Promise<TDeliveryOrder[]>;
  abstract create(data: CreateDeliveryOrderData): Promise<TDeliveryOrder>;
  abstract update(
    deliveryOrderId: string,
    data: UpdateDeliveryOrderData,
  ): Promise<TDeliveryOrder>;
  abstract countByStatus(status: DeliveryOrderStatus): Promise<number>;
}

export interface FindDeliveryOrdersByQuery {
  id?: string;
  keyword?: string;
  deliveryRouteId?: string;
  includeDeletedLocation?: boolean;
}

export interface CreateDeliveryOrderData {
  orderMediaId?: string | null;
  orderCode: string;
  orderName?: string | null;
  contactName: string;
  contactPhone: string;
  address: string;
  location: TPoint;
  appliedLocationId?: string | null;
  deliveryRouteId: string;
}

export interface UpdateDeliveryOrderData {
  orderCode?: string;
  orderName?: string | null;
  orderMediaId?: string | null;
  sequenceOrder?: number | null;
  status?: DeliveryOrderStatus;
  contactName?: string;
  contactPhone?: string;
  address?: string;
  location?: TPoint;
  appliedLocationId?: string | null;
  updatedAt?: Date;
  sortedAt?: Date | null;
  checkedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  rescheduledAt?: Date | null;
  deletedAt?: Date | null;
}
