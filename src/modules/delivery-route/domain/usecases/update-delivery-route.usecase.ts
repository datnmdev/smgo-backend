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
import { TDeliveryRoute } from '../entities/delivery-route.entity';
import { TDeliveryOrder } from '../entities/delivery-order.entity';

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
    manager?: any,
  ): Promise<void> {
    const route = (
      await this.getDeliveryRoutesUsecase.execute({
        userId,
        id: deliveryRouteId,
      })
    ).data?.[0];
    if (!route) {
      throw new DeliveryRouteNotFoundException();
    }

    if (manager) {
      await this._handle(route, data, userId, deliveryRouteId, manager);
    } else {
      const uowManager = await this.uowService.create(ORMType.TYPEORM);
      await transactionStorage.run(uowManager, async () => {
        try {
          await this.uowService.start();
          await this._handle(
            route,
            data,
            userId,
            deliveryRouteId,
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

  private async _handle(
    route: TDeliveryRoute & {
      totalOrders: number;
      totalPendingOrders: number;
      totalCheckedOrders: number;
      totalSortedOrders: number;
      totalDeliveredOrders: number;
      totalCancelledOrders: number;
      totalRescheduledOrders: number;
      orders: Array<
        TDeliveryOrder & {
          orderMediaUrl: string;
        }
      >;
    },
    data: UpdateDeliveryRouteData,
    userId: string,
    deliveryRouteId: string,
    manager?: any,
  ) {
    if (data.status == 'pending') {
      if (route.status != 'pending' && route.status != 'sorting') {
        throw new InvalidRouteStateForInspectionException();
      }
      if (route.status === 'sorting') {
        for (const order of route.orders) {
          if (order.status === 'sorted') {
            await this.updateDeliveryOrderUsecase.execute(
              userId,
              deliveryRouteId,
              order.id,
              {
                status: 'checked',
              },
              manager,
            );
          }
          await this.updateDeliveryOrderUsecase.execute(
            userId,
            deliveryRouteId,
            order.id,
            {
              sequenceOrder: null,
            },
            manager,
          );
        }
        data.totalDistance = null;
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
    await this.deliveryRouteRepo.update(deliveryRouteId, data, manager);
  }
}
