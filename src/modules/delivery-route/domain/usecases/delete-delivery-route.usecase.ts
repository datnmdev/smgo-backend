import { Injectable } from '@nestjs/common';
import { DeliveryRouteRepository } from '../repositories/delivery-route.repository';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';

@Injectable()
export class DeleteDeliveryRouteUsecase {
  constructor(private readonly deliveryRouteRepo: DeliveryRouteRepository) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    manager?: any,
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
    await this.deliveryRouteRepo.update(
      deliveryRouteId,
      {
        deletedAt: new Date(),
      },
      manager,
    );
  }
}
