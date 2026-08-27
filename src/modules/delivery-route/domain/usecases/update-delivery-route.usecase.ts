import { Injectable } from '@nestjs/common';
import {
  DeliveryRouteRepository,
  UpdateDeliveryRouteData,
} from '../repositories/delivery-route.repository';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';
import { InvalidRouteStateForInspectionException } from '../exceptions/invalid-route-state-for-inspection.exception';
import { GetDeliveryRoutesUsecase } from './get-delivery-routes.usecase';
import { CannotTransitionRouteToSortException } from '../exceptions/cannot-transition-route-to-sort.exception';
import { CannotTransitionRouteToDeliveringException } from '../exceptions/cannot-transition-route-to-delivering.exception';
import { CannotTransitionRouteToCompletedException } from '../exceptions/cannot-transition-route-to-complete.exception';
import { UpdateDeliveryOrderUsecase } from './update-delivery-order.usecase';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';

@Injectable()
export class UpdateDeliveryRouteUsecase {
  constructor(
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
    private readonly uowService: UnitOfWorkService,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    data: UpdateDeliveryRouteData,
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
        if (data.status == 'pending') {
          if (route.status != 'pending' && route.status != 'sorting') {
            throw new InvalidRouteStateForInspectionException();
          }
          if (route.status === 'sorting') {
            await Promise.all(
              route.orders
                .filter((order) => order.status == 'sorted')
                .map((order) =>
                  this.updateDeliveryOrderUsecase.execute(
                    userId,
                    deliveryRouteId,
                    order.id,
                    {
                      status: 'checked',
                    },
                    uowManager.manager,
                  ),
                ),
            );
          }
        } else if (data.status == 'sorting') {
          if (
            route.status != 'pending' ||
            route.orders.some((order) => order.status != 'checked')
          ) {
            throw new CannotTransitionRouteToSortException();
          }
        } else if (data.status == 'delivering') {
          if (
            route.status != 'sorting' ||
            route.orders.some((order) => order.status != 'sorted')
          ) {
            throw new CannotTransitionRouteToDeliveringException();
          }
        } else if (data.status == 'completed') {
          if (
            route.status != 'delivering' ||
            route.orders.some(
              (order) =>
                order.status != 'delivered' &&
                order.status != 'cancelled' &&
                order.status != 'rescheduled',
            )
          ) {
            throw new CannotTransitionRouteToCompletedException();
          }
        }
        data.updatedAt = new Date();
        await this.deliveryRouteRepo.update(
          deliveryRouteId,
          data,
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
