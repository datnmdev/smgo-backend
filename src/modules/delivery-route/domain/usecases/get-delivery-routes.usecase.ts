import { Injectable } from '@nestjs/common';
import {
  DeliveryRouteRepository,
  FindDeliveryRoutesByQuery,
} from '../repositories/delivery-route.repository';
import { TDeliveryRoute } from '../entities/delivery-route.entity';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { GetDeliveryOrdersUsecase } from './get-delivery-orders.usecase';

@Injectable()
export class GetDeliveryRoutesUsecase {
  constructor(
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
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
        e.orders = await this.getDeliveryOrdersUsecase.execute({
          deliveryRouteId: e.id,
        });
        e.totalOrders = e.orders.length;
        if (e.status === 'pending') {
          e.totalPendingOrders = e.orders.filter(
            (order) => order.status === 'pending',
          ).length;
          e.totalCheckedOrders = e.orders.filter(
            (order) => order.status === 'checked',
          ).length;
          e.totalSortedOrders = 0;
          e.totalDeliveredOrders = 0;
          e.totalCancelledOrders = 0;
          e.totalRescheduledOrders = 0;
        } else if (e.status === 'sorting') {
          e.totalPendingOrders = 0;
          e.totalCheckedOrders = e.totalOrders;
          e.totalSortedOrders = e.orders.filter(
            (order) => order.status === 'sorted',
          ).length;
          e.totalDeliveredOrders = 0;
          e.totalCancelledOrders = 0;
          e.totalRescheduledOrders = 0;
        } else {
          e.totalPendingOrders = 0;
          e.totalCheckedOrders = e.totalOrders;
          e.totalSortedOrders = e.totalOrders;
          e.totalDeliveredOrders = e.orders.filter(
            (order) => order.status === 'delivered',
          ).length;
          e.totalCancelledOrders = e.orders.filter(
            (order) => order.status === 'cancelled',
          ).length;
          e.totalRescheduledOrders = e.orders.filter(
            (order) => order.status === 'rescheduled',
          ).length;
        }
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
