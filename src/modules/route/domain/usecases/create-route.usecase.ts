import { RouteModel } from '@/@types/modules/route/domain/models/route.model';
import { Injectable } from '@nestjs/common';
import { RoutesRepository } from '../repositories/routes.repository';
import { CreateRouteData } from '@/@types/modules/route/domain/repositories/routes.repository';

@Injectable()
export class CreateRouteUsecase {
  constructor(
    private readonly routesRepo: RoutesRepository
  ) {}

  execute(userId: string, data: CreateRouteData): Promise<RouteModel> {
    return this.routesRepo.create(userId, data);
  }
}
