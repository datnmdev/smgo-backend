import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DeliveryRouteModel } from '../models/delivery-route.model';
import {
  Coordinate,
  CreateDeliveryRouteData,
  DeliveryRouteRepository,
  FindDeliveryRoutesByQuery,
  TSortResult,
  UpdateDeliveryRouteData,
} from '../../domain/repositories/delivery-route.repository';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TDeliveryRoute } from '../../domain/entities/delivery-route.entity';
import ky from 'ky';
import { ConfigService } from '@/core/config/config.service';
import { DeliveryOrderModel } from '../models/delivery-order.model';

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

  async sortOrdersForShortestRoute(
    source: Coordinate,
    orderModels: DeliveryOrderModel[],
  ): Promise<TSortResult> {
    if (!orderModels?.length) {
      return {
        orders: [],
        totalDistance: 0,
      };
    }

    const coordinates = [
      `${source.long},${source.lat}`,
      ...orderModels.map((order) => `${order.location.x},${order.location.y}`),
    ];

    const coordinatesString = coordinates.join(';');

    const client = ky.create({
      prefixUrl: this.configService.getOsrmConfig().baseUrl,
      timeout: 30_000,
    });

    const endpoint =
      `table/v1/bike/${coordinatesString}` + `?annotations=distance`;

    const data: {
      code: string;
      distances: Array<Array<number | null>>;
    } = await client.get(endpoint).json();

    if (data.code !== 'Ok' || !data.distances) {
      throw new Error('OSRM table request failed');
    }

    const distances = data.distances;

    const orderCount = orderModels.length;

    let route: number[] = [];

    const visited = new Uint8Array(orderCount);

    let currentPoint = 0;

    for (let step = 0; step < orderCount; step++) {
      let nearestOrder = -1;
      let nearestDistance = Infinity;

      for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
        if (visited[orderIndex]) continue;

        const pointIndex = orderIndex + 1;

        const distance = distances[currentPoint]?.[pointIndex];

        if (distance == null) continue;

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestOrder = orderIndex;
        }
      }

      if (nearestOrder === -1) {
        throw new Error(`Cannot find reachable order at step ${step}`);
      }

      route.push(nearestOrder);

      visited[nearestOrder] = 1;

      currentPoint = nearestOrder + 1;
    }

    const getPointIndex = (orderIndex: number): number => {
      return orderIndex + 1;
    };

    const getDistance = (
      fromOrderIndex: number | null,
      toOrderIndex: number,
    ): number => {
      const fromPoint =
        fromOrderIndex === null ? 0 : getPointIndex(fromOrderIndex);

      const toPoint = getPointIndex(toOrderIndex);

      const distance = distances[fromPoint]?.[toPoint];

      if (distance == null) {
        return Infinity;
      }

      return distance;
    };

    let improved = true;

    while (improved) {
      improved = false;

      for (let i = 0; i < route.length - 1; i++) {
        const a = i === 0 ? null : route[i - 1];

        const b = route[i];

        for (let j = i + 1; j < route.length; j++) {
          const c = route[j];

          const d = j + 1 < route.length ? route[j + 1] : null;

          const oldDistance =
            getDistance(a, b) + (d === null ? 0 : getDistance(c, d));

          const newDistance =
            getDistance(a, c) + (d === null ? 0 : getDistance(b, d));

          if (newDistance < oldDistance) {
            const reversed = route.slice(i, j + 1).reverse();

            route.splice(i, j - i + 1, ...reversed);

            improved = true;

            break;
          }
        }

        if (improved) break;
      }
    }

    let totalDistance = 0;
    let previousPoint = 0;
    for (const orderIndex of route) {
      const currentPoint = getPointIndex(orderIndex);
      const distance = distances[previousPoint]?.[currentPoint];
      if (distance == null) {
        throw new Error(
          `Cannot calculate distance from point ${previousPoint} to ${currentPoint}`,
        );
      }
      totalDistance += distance;
      previousPoint = currentPoint;
    }

    const orders = route.map((orderIndex, index) => ({
      ...orderModels[orderIndex],
      sequenceOrder: index + 1,
    }));

    return {
      orders,
      totalDistance,
    };
  }

  getShortestPathForFlexiblePoints(coordinates: Coordinate[]): Promise<any> {
    return;
  }
}
