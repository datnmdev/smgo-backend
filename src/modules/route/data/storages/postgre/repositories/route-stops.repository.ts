import { RouteStopsRepository } from '@/modules/route/domain/repositories/route-stops.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RouteStops } from '../entities/route-stops.entity';
import { Brackets, Repository } from 'typeorm';
import {
  CreateRouteStopData,
  FindRouteStopsByQuery,
  UpdateRouteStopData,
} from '@/@types/modules/route/domain/repositories/route-stops.repository';
import { RouteStopModel } from '@/@types/modules/route/domain/models/route-stop.model';

@Injectable()
export class PostgresRouteStopsRepository implements RouteStopsRepository {
  constructor(
    @InjectRepository(RouteStops)
    private readonly routeStopsRepo: Repository<RouteStops>,
  ) {}

  findByQuery(query?: FindRouteStopsByQuery): Promise<RouteStopModel[]> {
    return this.routeStopsRepo
      .createQueryBuilder('routeStops')
      .leftJoin('routeStops.route', 'route')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('routeStops.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'routeStops.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('routeStops.orderCode ILIKE :orderCode', {
                  orderCode: `%${query.keyword}%`,
                });
                qb.orWhere('routeStops.orderName ILIKE :orderName', {
                  orderName: `%${query.keyword}%`,
                });
                qb.orWhere('routeStops.contactPhone ILIKE :contactPhone', {
                  contactPhone: `%${query.keyword}%`,
                });
                qb.orWhere('routeStops.contactName ILIKE :contactName', {
                  contactName: `%${query.keyword}%`,
                });
                qb.orWhere('routeStops.address ILIKE :address', {
                  address: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.routeId === 'string') {
            qb.andWhere('routeStops.routeId = :routeId', {
              routeId: query.routeId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('routeStops.id = :id', {
              id: query.id,
            });
          }
          if (typeof query?.userId === 'string') {
            qb.andWhere('route.userId = :userId', {
              userId: query.userId,
            });
          }
        }),
      )
      .getMany();
  }

  create(data: CreateRouteStopData): Promise<RouteStopModel> {
    return this.routeStopsRepo.save(
      this.routeStopsRepo.create({
        ...data,
        status: 'pending',
      }),
    );
  }

  update(
    routeStopId: string,
    data: UpdateRouteStopData,
  ): Promise<RouteStopModel> {
    return this.routeStopsRepo.save(
      this.routeStopsRepo.create({
        ...data,
        id: routeStopId,
        updatedAt: new Date(),
      }),
    );
  }
}
