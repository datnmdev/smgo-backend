import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';
import { UpdateRouteData } from '@/@types/modules/route/domain/repositories/routes.repository';

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
    await this.routesRepo.update(userId, routeId, data);
  }
}
