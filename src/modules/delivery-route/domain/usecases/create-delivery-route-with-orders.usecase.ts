import { Injectable } from '@nestjs/common';
import {
  CreateDeliveryRouteWithOrdersData,
  DeliveryRouteRepository,
} from '../repositories/delivery-route.repository';
import { TDeliveryRoute } from '../entities/delivery-route.entity';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { CreateDeliveryOrderUsecase } from './create-delivery-order.usecase';
import { GetDeliveryRoutesUsecase } from './get-delivery-routes.usecase';
import { TDeliveryOrder } from '../entities/delivery-order.entity';

@Injectable()
export class CreateDeliveryRouteWithOrdersUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly uowService: UnitOfWorkService,
    private readonly createDeliveryOrderUsecase: CreateDeliveryOrderUsecase,
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
  ) {}

  async execute(
    data: CreateDeliveryRouteWithOrdersData,
  ): Promise<TDeliveryRouteIncludeSummary> {
    const uowManager = await this.uowService.create(ORMType.TYPEORM);
    return await transactionStorage.run(uowManager, async () => {
      try {
        await this.uowService.start();
        const newDeliveryRoute = await this.deliveryRouteRepo.create(
          {
            name: data.name,
            userId: data.userId,
          },
          uowManager.manager,
        );
        for (const orderData of data.orders) {
          await this.createDeliveryOrderUsecase.execute(
            data.userId,
            {
              ...orderData,
              deliveryRouteId: newDeliveryRoute.id,
            },
            uowManager.manager,
          );
        }
        await this.uowService.commit();
        return (
          await this.getDeliveryRoutesUsecase.execute({
            pageNumber: 1,
            pageSize: 1,
            id: newDeliveryRoute.id,
          })
        )?.data?.[0];
      } catch (error) {
        await this.uowService.rollback();
        throw error;
      } finally {
        await this.uowService.release();
      }
    });
  }
}

type TDeliveryRouteIncludeSummary = TDeliveryRoute & {
  totalOrders: number;
  totalPendingOrders: number;
  totalCheckedOrders: number;
  totalSortedOrders: number;
  totalDeliveredOrders: number;
  totalCancelledOrders: number;
  totalRescheduledOrders: number;
  orders: Array<TDeliveryOrder & { orderMediaUrl: string }>;
};
