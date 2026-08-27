import { Injectable } from '@nestjs/common';
import {
  DeliveryRouteRepository,
  FindDeliveryRoutesByQuery,
} from '../repositories/delivery-route.repository';
import { DeliveryOrderRepository } from '../repositories/delivery-order.repository';
import { TDeliveryRoute } from '../entities/delivery-route.entity';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { GetDeliveryOrdersUsecase } from './get-delivery-orders.usecase';

@Injectable()
export class GetDeliveryRoutesUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly getDeliveryOrdersUsecase: GetDeliveryOrdersUsecase,
  ) {}

  async execute(
    query?: FindDeliveryRoutesByQuery,
  ): Promise<TDeliveryRouteIncludeSummary> {
    const res = (await this.deliveryRouteRepo.findByQuery(
      query,
    )) as TDeliveryRouteIncludeSummary;

    await Promise.all(
      res.data.map(async (e) => {
        e.totalPendingOrders =
          await this.deliveryOrderRepo.countByStatus('pending');
        e.totalCheckedOrders =
          await this.deliveryOrderRepo.countByStatus('checked');
        e.totalSortedOrders =
          await this.deliveryOrderRepo.countByStatus('sorted');
        e.totalDeliveredOrders =
          await this.deliveryOrderRepo.countByStatus('delivered');
        e.totalCancelledOrders =
          await this.deliveryOrderRepo.countByStatus('cancelled');
        e.totalRescheduledOrders =
          await this.deliveryOrderRepo.countByStatus('rescheduled');
        e.totalOrders =
          e.totalPendingOrders +
          e.totalCheckedOrders +
          e.totalSortedOrders +
          e.totalDeliveredOrders +
          e.totalCancelledOrders +
          e.totalRescheduledOrders;
        e.orders = await this.getDeliveryOrdersUsecase.execute({
          deliveryRouteId: query.id,
        });
      }),
    );
    return res;
  }
}

type TDeliveryRouteIncludeSummary = TPaginationResponse<
  TDeliveryRoute & {
    totalOrders: number;
    totalPendingOrders: number;
    totalCheckedOrders: number;
    totalSortedOrders: number;
    totalDeliveredOrders: number;
    totalCancelledOrders: number;
    totalRescheduledOrders: number;
    orders: Array<TDeliveryOrder & { orderMediaUrl: string }>;
  }
>;
