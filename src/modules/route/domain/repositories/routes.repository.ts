import { RouteModel } from '@/@types/modules/route/domain/models/route.model';
import {
  CreateRouteData,
  FindRoutesByQuery,
  UpdateRouteData,
} from '@/@types/modules/route/domain/repositories/routes.repository';

export abstract class RoutesRepository {
  abstract findByQuery(query?: FindRoutesByQuery): Promise<RouteModel[]>;
  abstract create(data: CreateRouteData): Promise<RouteModel>;
  abstract update(routeId: string, data: UpdateRouteData): Promise<RouteModel>;
}
