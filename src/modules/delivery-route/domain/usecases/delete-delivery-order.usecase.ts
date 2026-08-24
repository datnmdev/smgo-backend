import { Injectable } from '@nestjs/common';
import { DeliveryOrderRepository } from '../repositories/delivery-order.repository';
import { DeliveryOrderNotFoundException } from '../exceptions/delivery-order-not-found.exception';
import { DeliveryRouteRepository } from '../repositories/delivery-route.repository';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';

@Injectable()
export class DeleteDeliveryOrderUsecase {
  constructor(
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderId: string,
  ): Promise<void> {
    const deliveryRoute = (
      await this.deliveryRouteRepo.findByQuery({
        pageNumber: 1,
        pageSize: 1,
        id: deliveryRouteId,
        userId,
      })
    ).data?.[0];
    if (!deliveryRoute) {
      throw new DeliveryRouteNotFoundException();
    }
    const deliveryOrder = (
      await this.deliveryOrderRepo.findByQuery({
        id: deliveryOrderId,
      })
    )?.[0];
    if (!deliveryOrder || deliveryOrder.deliveryRouteId !== deliveryRoute.id) {
      throw new DeliveryOrderNotFoundException();
    }
    await this.deliveryOrderRepo.update(deliveryOrderId, {
      deletedAt: new Date(),
    });
  }
}
