import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';
import { RouteStopsRepository } from '../repositories/route-stops.repository';
import { RouteStopNotFoundException } from '../exceptions/route-stop-not-found.exception';

@Injectable()
export class DeleteRouteStopUsecase {
  constructor(
    private readonly routeStopsRepo: RouteStopsRepository,
  ) {}

  async execute(userId: string, routeStopId: string): Promise<void> {
    const routeStop = (
      await this.routeStopsRepo.findByQuery({
        id: routeStopId,
        userId,
      })
    )?.[0];
    if (!routeStop) {
      throw new RouteStopNotFoundException();
    }
    await this.routeStopsRepo.update(routeStopId, {
      deletedAt: new Date(),
    });
  }
}
