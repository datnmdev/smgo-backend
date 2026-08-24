import { Injectable } from '@nestjs/common';
import {
  DeliveryRouteRepository,
  UpdateDeliveryRouteData,
} from '../repositories/delivery-route.repository';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';

@Injectable()
export class UpdateDeliveryRouteUsecase {
  constructor(private readonly deliveryRouteRepo: DeliveryRouteRepository) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    data: UpdateDeliveryRouteData,
  ): Promise<void> {
    const route = (
      await this.deliveryRouteRepo.findByQuery({
        userId,
        id: deliveryRouteId,
      })
    ).data?.[0];
    if (!route) {
      throw new DeliveryRouteNotFoundException();
    }
    data.updatedAt = new Date();
    await this.deliveryRouteRepo.update(deliveryRouteId, data);
  }
}
