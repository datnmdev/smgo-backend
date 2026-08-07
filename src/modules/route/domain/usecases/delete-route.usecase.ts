import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';
import { RouteNotFoundException } from '../exceptions/route-not-found.exception';

@Injectable()
export class DeleteRouteUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository
  ) {}

  async execute(userId: string, routeId: string): Promise<void> {
    const route = (await this.routesRepo.findByQuery({
      userId,
      id: routeId
    }))?.[0]
    if (!route) {
      throw new RouteNotFoundException();
    }
    await this.routesRepo.update(routeId, {
      deletedAt: new Date(),
    });
  }
}
