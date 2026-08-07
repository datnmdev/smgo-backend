import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';

@Injectable()
export class DeleteRouteUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository
  ) {}

  async execute(userId: string, routeId: string): Promise<void> {
    await this.routesRepo.update(userId, routeId, {
      deletedAt: new Date(),
    });
  }
}
