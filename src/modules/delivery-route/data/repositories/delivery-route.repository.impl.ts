import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DeliveryRouteModel } from '../models/delivery-route.model';
import {
  CreateDeliveryRouteData,
  DeliveryRouteRepository,
  FindDeliveryRoutesByQuery,
  UpdateDeliveryRouteData,
} from '../../domain/repositories/delivery-route.repository';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TDeliveryRoute } from '../../domain/entities/delivery-route.entity';

@Injectable()
export class DeliveryRouteRepositoryImpl implements DeliveryRouteRepository {
  constructor(
    @InjectRepository(DeliveryRouteModel)
    private readonly deliveryRouteRepo: Repository<DeliveryRouteModel>,
  ) {}

  async findByQuery(
    query?: FindDeliveryRoutesByQuery,
  ): Promise<TPaginationResponse<DeliveryRouteModel>> {
    const qb = this.deliveryRouteRepo
      .createQueryBuilder('deliveryRoute')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('deliveryRoute.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'deliveryRoute.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('deliveryRoute.name ILIKE :likeKeyword', {
                  likeKeyword: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.userId === 'string') {
            qb.andWhere('deliveryRoute.userId = :userId', {
              userId: query.userId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('deliveryRoute.id = :id', {
              id: query.id,
            });
          }
          if (typeof query?.status === 'string') {
            qb.andWhere('deliveryRoute.status = :status', {
              status: query.status,
            });
          }
        }),
      )
      .orderBy('deliveryRoute.createdAt', 'DESC');
    if (typeof query?.pageNumber == 'number' && typeof query?.pageSize) {
      qb.take(query.pageSize);
      qb.skip((query.pageNumber - 1) * query.pageSize);
    }
    const res = await qb.getManyAndCount();
    return {
      data: res[0],
      meta: {
        pageSize: query.pageSize ?? Number.MAX_SAFE_INTEGER,
        totalCount: res[1],
        currentPage: query.pageNumber ?? 1,
      },
    };
  }

  create(data: CreateDeliveryRouteData): Promise<TDeliveryRoute> {
    return this.deliveryRouteRepo.save(
      this.deliveryRouteRepo.create({
        ...data,
        status: 'pending',
      }),
    );
  }

  async update(
    deliveryRouteId: string,
    data: UpdateDeliveryRouteData,
  ): Promise<void> {
    await this.deliveryRouteRepo.save(
      this.deliveryRouteRepo.create({
        ...data,
        id: deliveryRouteId,
      }),
    );
  }
}
