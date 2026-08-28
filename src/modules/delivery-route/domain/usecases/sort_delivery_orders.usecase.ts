import { Injectable } from '@nestjs/common';
import {
  Coordinate,
  DeliveryRouteRepository,
} from '../repositories/delivery-route.repository';
import { GetDeliveryRoutesUsecase } from './get-delivery-routes.usecase';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';
import { UpdateDeliveryOrderUsecase } from './update-delivery-order.usecase';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { UpdateDeliveryRouteUsecase } from './update-delivery-route.usecase';

@Injectable()
export class SortDeliveryOrdersUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
    private readonly uowService: UnitOfWorkService,
    private readonly updateDeliveryRouteUsecase: UpdateDeliveryRouteUsecase,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    source: Coordinate,
  ): Promise<void> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    await transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        const route = (
          await this.getDeliveryRoutesUsecase.execute({
            userId,
            id: deliveryRouteId,
          })
        ).data?.[0];
        if (!route) {
          throw new DeliveryRouteNotFoundException();
        }
        const sortResult =
          await this.deliveryRouteRepo.sortOrdersForShortestRoute(
            source,
            route.orders,
          );
        for (const order of sortResult.orders) {
          await this.updateDeliveryOrderUsecase.execute(
            userId,
            deliveryRouteId,
            order.id,
            {
              sequenceOrder: order.sequenceOrder,
            },
            uowManager.manager,
          );
        }
        await this.updateDeliveryRouteUsecase.execute(
          userId,
          deliveryRouteId,
          {
            totalDistance: sortResult.totalDistance,
          },
          uowManager.manager,
        );
        await this.uowService.commit();
      } catch (error) {
        await this.uowService.rollback();
        throw error;
      } finally {
        await this.uowService.release();
      }
    });
  }
}
