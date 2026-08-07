import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';
import { UpdateRouteData } from '@/@types/modules/route/domain/repositories/routes.repository';
import { RouteNotFoundException } from '../exceptions/route-not-found.exception';

@Injectable()
export class UpdateRouteUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository
  ) {}

  async execute(
    userId: string,
    routeId: string,
    data: UpdateRouteData,
  ): Promise<void> {
    const route = (
      await this.routesRepo.findByQuery({
        userId,
        id: routeId,
      })
    )?.[0];
    if (!route) {
      throw new RouteNotFoundException();
    }
    await this.routesRepo.update(routeId, data);
  }
}
