import { RouteModel } from "@/@types/modules/route/domain/models/route.model";
import { Injectable } from "@nestjs/common";
import { RoutesRepository } from "../repositories/routes.repository";
import { FindRoutesByQuery } from "@/@types/modules/route/domain/repositories/routes.repository";

@Injectable()
export class GetRoutesUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository
  ) {}

  execute(query?: FindRoutesByQuery): Promise<RouteModel[]> {
    return this.routesRepo.findByQuery(query);
  }
}