import { Injectable } from '@nestjs/common';
import { DeliveryRouteRepository } from '../repositories/delivery-route.repository';
import { GetDeliveryRoutesUsecase } from './get-delivery-routes.usecase';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';
import { UpdateDeliveryOrderUsecase } from './update-delivery-order.usecase';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';

@Injectable()
export class SortDeliveryOrdersUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
    private readonly uowService: UnitOfWorkService,
  ) {}

  async execute(userId: string, deliveryRouteId: string): Promise<void> {
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
        const sortedCoordinates =
          await this.deliveryRouteRepo.sortPointsForShortestRoute(
            route.orders.map((order) => ({
              lat: order.location.y,
              long: order.location.x,
            })),
          );
        const indexs = {};
        await Promise.all(
          route.orders.map(async (order) => {
            const foundIndex = sortedCoordinates.findIndex(
              (coor, index) =>
                coor.lat === order.location.y &&
                coor.long === order.location.x &&
                indexs[`${index}`] !== undefined,
            );
            indexs[`${foundIndex}`] = foundIndex;
            return this.updateDeliveryOrderUsecase.execute(
              userId,
              deliveryRouteId,
              order.id,
              {
                sequenceOrder: foundIndex + 1,
                status: 'sorted',
              },
              uowManager.manager,
            );
          }),
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
