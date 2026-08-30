import { Injectable } from '@nestjs/common';
import {
  CreateDeliveryRouteData,
  DeliveryRouteRepository,
} from '../repositories/delivery-route.repository';
import { TDeliveryRoute } from '../entities/delivery-route.entity';

@Injectable()
export class CreateDeliveryRouteUsecase {
  constructor(private readonly deliveryRouteRepo: DeliveryRouteRepository) {}

  execute(
    data: CreateDeliveryRouteData,
    manager?: any,
  ): Promise<TDeliveryRoute> {
    return this.deliveryRouteRepo.create(data, manager);
  }
}
