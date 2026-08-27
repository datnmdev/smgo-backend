import {
  TPaginationQuery,
  TPaginationResponse,
} from '@/core/common/pagination.entity';
import {
  TDeliveryRoute,
  TDeliveryRouteStatus,
} from '../entities/delivery-route.entity';

export abstract class DeliveryRouteRepository {
  abstract findByQuery(
    query?: FindDeliveryRoutesByQuery,
  ): Promise<TPaginationResponse<TDeliveryRoute>>;
  abstract create(data: CreateDeliveryRouteData): Promise<TDeliveryRoute>;
  abstract update(
    routeId: string,
    data: UpdateDeliveryRouteData,
    manager?: any,
  ): Promise<void>;
  abstract sortPointsForShortestRoute(
    coordinates: Coordinate[],
  ): Promise<Coordinate[]>;
  abstract getShortestPathForFlexiblePoints(
    coordinates: Coordinate[],
  ): Promise<any>;
}

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

export interface UpdateDeliveryRouteData {
  name?: string;
  status?: TDeliveryRouteStatus;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
