import { Injectable } from '@nestjs/common';
import { RouteStopsRepository } from '../repositories/route-stops.repository';
import { CreateRouteStopData } from '@/@types/modules/route/domain/repositories/route-stops.repository';
import { RouteStopModel } from '@/@types/modules/route/domain/models/route-stop.model';
import { RoutesRepository } from '../repositories/routes.repository';
import { RouteNotFoundException } from '../exceptions/route-not-found.exception';

@Injectable()
export class CreateRouteStopUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository,
    private readonly routeStopsRepo: RouteStopsRepository,
  ) {}

  async execute(
    userId: string,
    data: CreateRouteStopData,
  ): Promise<RouteStopModel> {
    const route = (
      await this.routesRepo.findByQuery({
        id: data.routeId,
        userId,
      })
    )?.[0];
    if (!route) {
      throw new RouteNotFoundException();
    }
    return this.routeStopsRepo.create(data);
  }
}
