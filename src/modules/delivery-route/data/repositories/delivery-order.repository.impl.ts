import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import { DeliveryOrderModel } from '../models/delivery-order.model';
import {
  CreateDeliveryOrderData,
  DeliveryOrderRepository,
  FindDeliveryOrdersByQuery,
  UpdateDeliveryOrderData,
} from '../../domain/repositories/delivery-order.repository';
import {
  DeliveryOrderStatus,
  TDeliveryOrder,
} from '../../domain/entities/delivery-order.entity';

@Injectable()
export class DeliveryOrderRepositoryImpl implements DeliveryOrderRepository {
  constructor(
    @InjectRepository(DeliveryOrderModel)
    private readonly deliveryOrderRepo: Repository<DeliveryOrderModel>,
  ) {}

  findByQuery(query?: FindDeliveryOrdersByQuery): Promise<TDeliveryOrder[]> {
    return this.deliveryOrderRepo
      .createQueryBuilder('deliveryOrder')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('deliveryOrder.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'deliveryOrder.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('deliveryOrder.orderCode ILIKE :orderCode', {
                  orderCode: `%${query.keyword}%`,
                });
                qb.orWhere('deliveryOrder.orderName ILIKE :orderName', {
                  orderName: `%${query.keyword}%`,
                });
                qb.orWhere('deliveryOrder.contactPhone ILIKE :contactPhone', {
                  contactPhone: `%${query.keyword}%`,
                });
                qb.orWhere('deliveryOrder.contactName ILIKE :contactName', {
                  contactName: `%${query.keyword}%`,
                });
                qb.orWhere('deliveryOrder.address ILIKE :address', {
                  address: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.deliveryRouteId === 'string') {
            qb.andWhere('deliveryOrder.deliveryRouteId = :deliveryRouteId', {
              deliveryRouteId: query.deliveryRouteId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('deliveryOrder.id = :id', {
              id: query.id,
            });
          }
        }),
      )
      .getMany();
  }

  create(data: CreateDeliveryOrderData): Promise<TDeliveryOrder> {
    return this.deliveryOrderRepo.save(this.deliveryOrderRepo.create(data));
  }

  update(
    deliveryOrderId: string,
    data: UpdateDeliveryOrderData,
  ): Promise<DeliveryOrderModel> {
    return this.deliveryOrderRepo.save(
      this.deliveryOrderRepo.create({
        ...data,
        id: deliveryOrderId,
      }),
    );
  }

  countByStatus(status: DeliveryOrderStatus): Promise<number> {
    return this.deliveryOrderRepo.countBy({
      deletedAt: IsNull(),
      status,
    });
  }
}
