import { Injectable } from '@nestjs/common';
import {
  DeliveryOrderRepository,
  UpdateDeliveryOrderData,
} from '../repositories/delivery-order.repository';
import { DeliveryOrderNotFoundException } from '../exceptions/delivery-order-not-found.exception';
import { DeliveryRouteRepository } from '../repositories/delivery-route.repository';
import { DeliveryRouteNotFoundException } from '../exceptions/delivery-route-not-found.exception';
import { DeliveryOrderNotRoutedException } from '../exceptions/delivery-order-not-routed.exception';
import { InvalidDeliveryOrderStatusTransitionException } from '../exceptions/invalid-delivery-order-status-transition.exception';
import { DeliveryOrderAlreadyCheckedException } from '../exceptions/delivery-order-already-checked.exception';
import { DeliveryOrderCannotBeSetToPendingInspectionException } from '../exceptions/delivery-order-cannot-be-set-to-pending-inspection.exception';
import { DeliveryOrderCannotBeSetToInspectedException } from '../exceptions/delivery-order-cannot-be-set-to-inspected.exception';
import { DeliveryOrderCannotBeSetToSortedException } from '../exceptions/delivery-order-cannot-be-set-to-sorted.exception';
import { DeliveryOrderCannotBeSetToDeliveredException } from '../exceptions/delivery-order-cannot-be-set-to-delivered.exception';
import { DeliveryOrderCannotBeSetToCancelledException } from '../exceptions/delivery-order-cannot-be-set-to-cancelled.exception';
import { DeliveryOrderCannotBeSetToRescheduledException } from '../exceptions/delivery-order-cannot-be-set-to-rescheduled.exception';

@Injectable()
export class UpdateDeliveryOrderUsecase {
  constructor(
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly deliveryRouteRepo: DeliveryRouteRepository,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderId: string,
    data: UpdateDeliveryOrderData,
    manager?: any,
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
    const now = new Date();
    if (data.status === 'pending') {
      if (deliveryRoute.status !== 'pending') {
        throw new DeliveryOrderCannotBeSetToPendingInspectionException();
      }
      if (
        deliveryOrder.status !== 'pending' &&
        deliveryOrder.status !== 'checked'
      ) {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order to the pending inspection status because its previous status is neither checked nor pending inspection',
        );
      }
      data.checkedAt = null;
      data.sortedAt = null;
      data.sequenceOrder = null;
      data.deliveredAt = null;
      data.cancelledAt = null;
      data.rescheduledAt = null;
    } else if (data.status === 'checked') {
      if (deliveryRoute.status !== 'pending') {
        throw new DeliveryOrderCannotBeSetToInspectedException();
      }
      if (deliveryOrder.status === 'checked') {
        throw new DeliveryOrderAlreadyCheckedException();
      }
      if (
        deliveryOrder.status !== 'pending' &&
        deliveryOrder.status !== 'sorted'
      ) {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order status to checked because its previous status is neither pending inspection nor scheduled',
        );
      }
      if (deliveryOrder.status === 'pending') {
        data.checkedAt = now;
      }
      data.sortedAt = null;
      data.sequenceOrder = null;
      data.deliveredAt = null;
      data.cancelledAt = null;
      data.rescheduledAt = null;
    } else if (data.status === 'sorted') {
      if (deliveryRoute.status !== 'sorting') {
        throw new DeliveryOrderCannotBeSetToSortedException();
      }
      if (deliveryOrder.status !== 'checked') {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order status to scheduled because its current status is not checked',
        );
      }
      if (!deliveryOrder.sequenceOrder) {
        throw new DeliveryOrderNotRoutedException();
      }
      data.sortedAt = now;
      data.deliveredAt = null;
      data.cancelledAt = null;
      data.rescheduledAt = null;
    } else if (data.status === 'delivered') {
      if (deliveryRoute.status !== 'in_progress') {
        throw new DeliveryOrderCannotBeSetToDeliveredException();
      }
      if (deliveryOrder.status !== 'sorted') {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order status to delivered because its current status is not scheduled',
        );
      }
      data.deliveredAt = now;
      data.cancelledAt = null;
      data.rescheduledAt = null;
    } else if (data.status === 'cancelled') {
      if (deliveryRoute.status !== 'in_progress') {
        throw new DeliveryOrderCannotBeSetToCancelledException();
      }
      if (deliveryOrder.status !== 'sorted') {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order status to failed because its current status is not scheduled',
        );
      }
      data.deliveredAt = null;
      data.cancelledAt = now;
      data.rescheduledAt = null;
    } else if (data.status === 'rescheduled') {
      if (deliveryRoute.status !== 'in_progress') {
        throw new DeliveryOrderCannotBeSetToRescheduledException();
      }
      if (deliveryOrder.status !== 'sorted') {
        throw new InvalidDeliveryOrderStatusTransitionException(
          'Cannot transition the delivery order status to rescheduled because its current status is not scheduled',
        );
      }
      data.deliveredAt = null;
      data.cancelledAt = null;
      data.rescheduledAt = now;
    }
    data.updatedAt = now;
    await this.deliveryOrderRepo.update(deliveryOrderId, data, manager);
  }
}
