import { Injectable } from '@nestjs/common';
import { RouteStopsRepository } from '../repositories/route-stops.repository';
import { UpdateRouteStopData } from '@/@types/modules/route/domain/repositories/route-stops.repository';
import { RouteStopNotFoundException } from '../exceptions/route-stop-not-found.exception';

@Injectable()
export class UpdateRouteStopUsecase {
  constructor(private readonly routeStopsRepo: RouteStopsRepository) {}

  async execute(
    userId: string,
    routeStopId: string,
    data: UpdateRouteStopData,
  ): Promise<void> {
    const routeStop = (
      await this.routeStopsRepo.findByQuery({
        id: routeStopId,
        userId,
      })
    )?.[0];
    if (!routeStop) {
      throw new RouteStopNotFoundException();
    }
    const now = new Date();
    if (data.status === 'checked') {
      data.checkedAt = now;
    } else if (data.status === 'delivered') {
      data.deliveredAt = now;
    } else if (data.status === 'cancelled') {
      data.cancelledAt = now;
    }
    data.updatedAt = now;
    await this.routeStopsRepo.update(routeStopId, data);
  }
}
