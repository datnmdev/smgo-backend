import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DeliveryRouteModel } from '../models/delivery-route.model';
import {
  Coordinate,
  CreateDeliveryRouteData,
  DeliveryRouteRepository,
  FindDeliveryRoutesByQuery,
  UpdateDeliveryRouteData,
} from '../../domain/repositories/delivery-route.repository';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TDeliveryRoute } from '../../domain/entities/delivery-route.entity';
import ky from 'ky';
import { ConfigService } from '@/core/config/config.service';

@Injectable()
export class DeliveryRouteRepositoryImpl implements DeliveryRouteRepository {
  constructor(
    @InjectRepository(DeliveryRouteModel)
    private readonly deliveryRouteRepo: Repository<DeliveryRouteModel>,
    private readonly configService: ConfigService,
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
    manager?: any,
  ): Promise<void> {
    const repo: Repository<DeliveryRouteModel> = !manager
      ? this.deliveryRouteRepo
      : manager.manager.getRepository(DeliveryRouteModel);
    await repo.save(
      this.deliveryRouteRepo.create({
        ...data,
        id: deliveryRouteId,
      }),
    );
  }

  async sortPointsForShortestRoute(
    coordinates: Coordinate[],
  ): Promise<Coordinate[]> {
    if (!coordinates || coordinates.length <= 1) return coordinates;

    const coordinatesString = coordinates
      .map((coor) => `${coor.lat},${coor.long}`)
      .join(';');
    const endpoint = `trip/v1/driving/${coordinatesString}?overview=false&source=first`;
    console.log(endpoint);
    const client = ky.create({
      prefixUrl: this.configService.getOsrmConfig().baseUrl,
      timeout: 10000,
    });
    const data: any = await client.get(endpoint).json();
    const waypoints = data.waypoints;
    waypoints.sort((a, b) => a.waypoint_index - b.waypoint_index);
    return waypoints.map((wp: any) => ({
      lat: wp.location[1],
      long: wp.location[0],
    }));
  }

  getShortestPathForFlexiblePoints(coordinates: Coordinate[]): Promise<any> {
    return;
  }
}
