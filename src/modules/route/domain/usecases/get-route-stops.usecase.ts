import { Injectable } from "@nestjs/common";
import { RouteStopsRepository } from "../repositories/route-stops.repository";
import { FindRouteStopsByQuery } from "@/@types/modules/route/domain/repositories/route-stops.repository";
import { RouteStopModel } from "@/@types/modules/route/domain/models/route-stop.model";

@Injectable()
export class GetRouteStopsUsecase {
  constructor(
    private readonly routeStopsRepo: RouteStopsRepository
  ) {}

  execute(query?: FindRouteStopsByQuery): Promise<RouteStopModel[]> {
    return this.routeStopsRepo.findByQuery(query);
  }
}