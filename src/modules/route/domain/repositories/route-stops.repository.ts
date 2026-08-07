import { RouteStopModel } from '@/@types/modules/route/domain/models/route-stop.model';
import {
  CreateRouteStopData,
  FindRouteStopsByQuery,
  UpdateRouteStopData,
} from '@/@types/modules/route/domain/repositories/route-stops.repository';

export abstract class RouteStopsRepository {
  abstract findByQuery(
    query?: FindRouteStopsByQuery,
  ): Promise<RouteStopModel[]>;
  abstract create(data: CreateRouteStopData): Promise<RouteStopModel>;
  abstract update(
    routeStopId: string,
    data: UpdateRouteStopData,
  ): Promise<RouteStopModel>;
}
