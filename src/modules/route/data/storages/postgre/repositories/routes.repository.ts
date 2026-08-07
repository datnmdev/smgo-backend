import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { RoutesRepository } from '@/modules/route/domain/repositories/routes.repository';
import { Routes } from '../entities/routes.entity';
import {
  CreateRouteData,
  FindRoutesByQuery,
  UpdateRouteData,
} from '@/@types/modules/route/domain/repositories/routes.repository';
import { RouteModel } from '@/@types/modules/route/domain/models/route.model';

@Injectable()
export class PostgresRoutesRepository implements RoutesRepository {
  constructor(
    @InjectRepository(Routes)
    private readonly routesRepo: Repository<Routes>,
  ) {}

  findByQuery(query?: FindRoutesByQuery): Promise<RouteModel[]> {
    return this.routesRepo
      .createQueryBuilder('routes')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('routes.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'routes.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('routes.name ILIKE :likeKeyword', {
                  likeKeyword: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.userId === 'string') {
            qb.andWhere('routes.userId = :userId', {
              userId: query.userId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('routes.id = :id', {
              id: query.id,
            });
          }
        }),
      )
      .getMany();
  }

  create(data: CreateRouteData): Promise<RouteModel> {
    return this.routesRepo.save(
      this.routesRepo.create({
        ...data,
        status: 'pending',
      }),
    );
  }

  update(routeId: string, data: UpdateRouteData): Promise<RouteModel> {
    return this.routesRepo.save(
      this.routesRepo.create({
        ...data,
        id: routeId,
      }),
    );
  }
}
