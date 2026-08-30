import {
  TPaginationQuery,
  TPaginationResponse,
} from '@/core/common/pagination.entity';
import {
  TDeliveryRoute,
  TDeliveryRouteStatus,
} from '../entities/delivery-route.entity';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { CreateDeliveryOrderData } from './delivery-order.repository';
import { TPoint } from '@/modules/user/domain/entities/location.entity';

export abstract class DeliveryRouteRepository {
  abstract findByQuery(
    query?: FindDeliveryRoutesByQuery,
    manager?: any,
  ): Promise<TPaginationResponse<TDeliveryRoute>>;
  abstract create(
    data: CreateDeliveryRouteData,
    manager?: any,
  ): Promise<TDeliveryRoute>;
  abstract update(
    routeId: string,
    data: UpdateDeliveryRouteData,
    manager?: any,
  ): Promise<void>;
  abstract sortOrdersForShortestRoute(
    source: Coordinate,
    orders: TDeliveryOrder[],
  ): Promise<TSortResult>;
  abstract getShortestPathForFlexiblePoints(
    coordinates: Coordinate[],
  ): Promise<any>;
}

export type TSortResult = {
  orders: TDeliveryOrder[];
  totalDistance: number;
};

export interface Coordinate {
  lat: number;
  long: number;
}

export interface FindDeliveryRoutesByQuery extends TPaginationQuery {
  id?: string;
  keyword?: string;
  userId?: string;
  includeDeletedLocation?: boolean;
  status?: TDeliveryRouteStatus;
}

export interface CreateDeliveryRouteData {
  name: string;
  userId: string;
}

interface DeliveryOrderData {
  orderMediaId?: string | null;
  orderCode: string;
  orderName?: string | null;
  contactName: string;
  contactPhone: string;
  address: string;
  location: TPoint;
  appliedLocationId?: string | null;
}

export interface CreateDeliveryRouteWithOrdersData {
  name: string;
  userId: string;
  orders: DeliveryOrderData[];
}

export interface UpdateDeliveryRouteData {
  name?: string;
  status?: TDeliveryRouteStatus;
  updatedAt?: Date;
  totalDistance?: number | null;
  deletedAt?: Date | null;
}
