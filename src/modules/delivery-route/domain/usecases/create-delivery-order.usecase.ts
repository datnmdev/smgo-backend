import { Injectable } from '@nestjs/common';
import {
  CreateDeliveryOrderData,
  DeliveryOrderRepository,
} from '../repositories/delivery-order.repository';
import { DeliveryRouteRepository } from '../repositories/delivery-route.repository';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';
import { AttachMediaUsecase } from '@/modules/storage/domain/usecases/attach-media.usecase';

@Injectable()
export class CreateDeliveryOrderUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly attachMediaUsecase: AttachMediaUsecase,
  ) {}

  async execute(
    userId: string,
    data: CreateDeliveryOrderData,
    manager?: any,
  ): Promise<TDeliveryOrder> {
    const route = (
      await this.deliveryRouteRepo.findByQuery(
        {
          id: data.deliveryRouteId,
          userId,
        },
        manager,
      )
    ).data?.[0];
    if (!route) {
      throw new DeliveryRouteNotFoundException();
    }
    const res = await this.deliveryOrderRepo.create(data, manager);
    if (res.orderMediaId != null) {
      await this.attachMediaUsecase.execute([res.orderMediaId]);
    }
    return res;
  }
}
