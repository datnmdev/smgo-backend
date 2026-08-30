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
    manager?: any,
  ): Promise<TPaginationResponse<DeliveryRouteModel>> {
    const repo: Repository<DeliveryRouteModel> = !manager
      ? this.deliveryRouteRepo
      : manager.manager.getRepository(DeliveryRouteModel);
    const qb = repo
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

  create(
    data: CreateDeliveryRouteData,
    manager?: any,
  ): Promise<TDeliveryRoute> {
    const repo: Repository<DeliveryRouteModel> = !manager
      ? this.deliveryRouteRepo
      : manager.manager.getRepository(DeliveryRouteModel);
    return repo.save(
      repo.create({
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

    const endpoint = `table/v1/bike/${coordinatesString}?annotations=distance`;

    const data: {
      code: string;
      distances: Array<Array<number | null>>;
    } = await client.get(endpoint).json();

    if (data.code !== 'Ok' || !data.distances) {
      throw new Error('OSRM table request failed');
    }

    const distances = data.distances;
    const orderCount = orderModels.length;

    /**
     * ============================================================
     * CONSTANTS
     * ============================================================
     */

    // Với 100 order:
    // 24-32 initial solutions là đủ tốt.
    const INITIAL_ROUTE_COUNT = Math.min(32, Math.max(8, orderCount));

    // Giới hạn số vòng local search để tránh CPU spike.
    const MAX_LOCAL_SEARCH_ITERATIONS = 100;

    /**
     * ============================================================
     * HELPERS
     * ============================================================
     */

    const getPointIndex = (orderIndex: number): number => {
      return orderIndex + 1;
    };

    /**
     * Distance:
     *
     * null => không đi được
     * Infinity => không hợp lệ
     */
    const getMatrixDistance = (fromPoint: number, toPoint: number): number => {
      const distance = distances[fromPoint]?.[toPoint];

      if (distance == null) {
        return Infinity;
      }

      return distance;
    };

    /**
     * Source -> order
     */
    const getSourceDistance = (orderIndex: number): number => {
      return getMatrixDistance(0, getPointIndex(orderIndex));
    };

    /**
     * Order -> Order
     */
    const getOrderDistance = (
      fromOrderIndex: number,
      toOrderIndex: number,
    ): number => {
      return getMatrixDistance(
        getPointIndex(fromOrderIndex),
        getPointIndex(toOrderIndex),
      );
    };

    /**
     * Tính toàn bộ route distance.
     *
     * Source
     *   ↓
     * A
     *   ↓
     * B
     *   ↓
     * C
     */
    const calculateRouteDistance = (route: number[]): number => {
      if (!route.length) {
        return 0;
      }

      let total = getSourceDistance(route[0]);

      if (!Number.isFinite(total)) {
        return Infinity;
      }

      for (let i = 0; i < route.length - 1; i++) {
        const distance = getOrderDistance(route[i], route[i + 1]);

        if (!Number.isFinite(distance)) {
          return Infinity;
        }

        total += distance;
      }

      return total;
    };

    /**
     * ============================================================
     * INITIAL ROUTE #1
     *
     * Standard Nearest Neighbor
     * ============================================================
     */

    const buildNearestNeighbor = (
      forcedFirst: number | null = null,
      randomness = 0,
    ): number[] | null => {
      const route: number[] = [];
      const visited = new Uint8Array(orderCount);

      let currentPoint = 0;

      /**
       * Nếu muốn ép order đầu tiên.
       */
      if (forcedFirst !== null) {
        const distance = getSourceDistance(forcedFirst);

        if (!Number.isFinite(distance)) {
          return null;
        }

        route.push(forcedFirst);
        visited[forcedFirst] = 1;

        currentPoint = getPointIndex(forcedFirst);
      }

      while (route.length < orderCount) {
        const candidates: Array<{
          index: number;
          distance: number;
        }> = [];

        for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
          if (visited[orderIndex]) {
            continue;
          }

          const distance = getMatrixDistance(
            currentPoint,
            getPointIndex(orderIndex),
          );

          if (!Number.isFinite(distance)) {
            continue;
          }

          candidates.push({
            index: orderIndex,
            distance,
          });
        }

        if (!candidates.length) {
          return null;
        }

        candidates.sort((a, b) => a.distance - b.distance);

        let selected = candidates[0];

        /**
         * Randomized Nearest Neighbor.
         *
         * randomness = 0:
         *   luôn lấy nearest.
         *
         * randomness > 0:
         *   đôi khi chọn một trong top candidates.
         *
         * Điều này giúp tạo nhiều route khác nhau.
         */
        if (
          randomness > 0 &&
          candidates.length > 1 &&
          Math.random() < randomness
        ) {
          const candidateCount = Math.min(5, candidates.length);

          const randomIndex = Math.floor(Math.random() * candidateCount);

          selected = candidates[randomIndex];
        }

        route.push(selected.index);
        visited[selected.index] = 1;

        currentPoint = getPointIndex(selected.index);
      }

      return route;
    };

    /**
     * ============================================================
     * INITIAL ROUTE #2
     *
     * Farthest Insertion
     *
     * Đây là cách tạo initial route tốt hơn chỉ dùng NN
     * trong nhiều trường hợp.
     * ============================================================
     */

    const buildFarthestInsertion = (): number[] | null => {
      if (orderCount <= 2) {
        return buildNearestNeighbor();
      }

      const unused = new Set<number>();

      for (let i = 0; i < orderCount; i++) {
        unused.add(i);
      }

      /**
       * Chọn điểm xa source nhất.
       */
      let first = -1;
      let firstDistance = -Infinity;

      for (const orderIndex of unused) {
        const distance = getSourceDistance(orderIndex);

        if (Number.isFinite(distance) && distance > firstDistance) {
          firstDistance = distance;
          first = orderIndex;
        }
      }

      if (first === -1) {
        return null;
      }

      unused.delete(first);

      /**
       * Chọn điểm xa first nhất.
       */
      let second = -1;
      let secondDistance = -Infinity;

      for (const orderIndex of unused) {
        const distance = getOrderDistance(first, orderIndex);

        if (Number.isFinite(distance) && distance > secondDistance) {
          secondDistance = distance;
          second = orderIndex;
        }
      }

      if (second === -1) {
        return null;
      }

      unused.delete(second);

      let route = [first, second];

      /**
       * Insert từng điểm còn lại vào vị trí tốt nhất.
       */
      while (unused.size > 0) {
        let farthestOrder = -1;
        let farthestDistance = -Infinity;

        /**
         * Tìm điểm xa route hiện tại nhất.
         */
        for (const orderIndex of unused) {
          let nearest = Infinity;

          const sourceDistance = getSourceDistance(orderIndex);

          if (Number.isFinite(sourceDistance)) {
            nearest = Math.min(nearest, sourceDistance);
          }

          for (const routeOrder of route) {
            const distance = getOrderDistance(routeOrder, orderIndex);

            if (Number.isFinite(distance)) {
              nearest = Math.min(nearest, distance);
            }
          }

          if (nearest > farthestDistance && Number.isFinite(nearest)) {
            farthestDistance = nearest;
            farthestOrder = orderIndex;
          }
        }

        if (farthestOrder === -1) {
          return null;
        }

        /**
         * Tìm vị trí insert tốt nhất.
         */
        let bestPosition = -1;
        let bestIncrease = Infinity;

        for (let position = 0; position <= route.length; position++) {
          const previous = position === 0 ? null : route[position - 1];

          const next = position === route.length ? null : route[position];

          let increase = 0;

          if (previous === null) {
            const distance = getSourceDistance(farthestOrder);

            if (!Number.isFinite(distance)) {
              continue;
            }

            increase += distance;
          } else {
            const distance = getOrderDistance(previous, farthestOrder);

            if (!Number.isFinite(distance)) {
              continue;
            }

            increase += distance;
          }

          if (next !== null) {
            const distance = getOrderDistance(farthestOrder, next);

            if (!Number.isFinite(distance)) {
              continue;
            }

            increase += distance;

            /**
             * Nếu insert vào giữa:
             *
             * A -> B
             *
             * thành:
             *
             * A -> X -> B
             *
             * phải bỏ A -> B.
             */
            if (previous !== null) {
              const oldDistance = getOrderDistance(previous, next);

              if (!Number.isFinite(oldDistance)) {
                continue;
              }

              increase -= oldDistance;
            }
          }

          if (increase < bestIncrease) {
            bestIncrease = increase;
            bestPosition = position;
          }
        }

        if (bestPosition === -1) {
          return null;
        }

        route = [
          ...route.slice(0, bestPosition),
          farthestOrder,
          ...route.slice(bestPosition),
        ];

        unused.delete(farthestOrder);
      }

      return route;
    };

    /**
     * ============================================================
     * DIRECTED 2-OPT
     *
     * CỰC KỲ QUAN TRỌNG:
     *
     * Đây là ATSP, nên:
     *
     * A -> B != B -> A
     *
     * Khi reverse:
     *
     * A -> B -> C -> D
     *
     * thành:
     *
     * A -> C -> B -> D
     *
     * các cạnh bên trong đoạn cũng thay đổi.
     *
     * Ta tính reverse internal cost bằng cách cộng dần,
     * nên mỗi pass vẫn O(n²).
     * ============================================================
     */

    const improve2Opt = (route: number[]): boolean => {
      const n = route.length;

      if (n < 3) {
        return false;
      }

      for (let i = 0; i < n - 1; i++) {
        /**
         * old internal:
         *
         * route[i]
         *   -> route[i + 1]
         *   -> ...
         *   -> route[j]
         *
         * reversed internal:
         *
         * route[j]
         *   -> route[j - 1]
         *   -> ...
         *   -> route[i]
         *
         * Ta cộng dần khi j tăng.
         */
        let reversedInternalDistance = 0;

        for (let j = i + 1; j < n; j++) {
          /**
           * Khi tăng j:
           *
           * thêm:
           *
           * route[j] -> route[j - 1]
           */
          const reverseEdge = getOrderDistance(route[j], route[j - 1]);

          if (!Number.isFinite(reverseEdge)) {
            continue;
          }

          reversedInternalDistance += reverseEdge;

          /**
           * Old internal:
           *
           * route[i]
           * -> route[i+1]
           * ...
           * -> route[j]
           *
           * Tính bằng loop đoạn này.
           *
           * n <= 100 nên vẫn rất nhẹ.
           */
          let oldInternalDistance = 0;

          for (let k = i; k < j; k++) {
            const edge = getOrderDistance(route[k], route[k + 1]);

            if (!Number.isFinite(edge)) {
              oldInternalDistance = Infinity;
              break;
            }

            oldInternalDistance += edge;
          }

          if (!Number.isFinite(oldInternalDistance)) {
            continue;
          }

          /**
           * Before:
           *
           * source/A -> B ... C -> D
           *
           * After:
           *
           * source/A -> C ... B -> D
           */

          const before =
            i === 0
              ? getSourceDistance(route[i])
              : getOrderDistance(route[i - 1], route[i]);

          if (!Number.isFinite(before)) {
            continue;
          }

          const after =
            j + 1 >= n ? 0 : getOrderDistance(route[j], route[j + 1]);

          if (!Number.isFinite(after)) {
            continue;
          }

          const oldDistance = before + oldInternalDistance + after;

          /**
           * New boundary:
           *
           * A -> C
           *
           * B -> D
           */
          const newBefore =
            i === 0
              ? getSourceDistance(route[j])
              : getOrderDistance(route[i - 1], route[j]);

          if (!Number.isFinite(newBefore)) {
            continue;
          }

          const newAfter =
            j + 1 >= n ? 0 : getOrderDistance(route[i], route[j + 1]);

          if (!Number.isFinite(newAfter)) {
            continue;
          }

          const newDistance = newBefore + reversedInternalDistance + newAfter;

          if (newDistance + 0.01 < oldDistance) {
            /**
             * Reverse segment.
             */
            let left = i;
            let right = j;

            while (left < right) {
              const temp = route[left];

              route[left] = route[right];
              route[right] = temp;

              left++;
              right--;
            }

            return true;
          }
        }
      }

      return false;
    };

    /**
     * ============================================================
     * RELOCATE
     *
     * A -> B -> X -> C -> D
     *
     * remove X:
     *
     * A -> B -> C -> D
     *
     * rồi insert X vào vị trí khác.
     *
     * Delta O(1).
     * ============================================================
     */

    const improveRelocate = (route: number[]): boolean => {
      const n = route.length;

      if (n < 3) {
        return false;
      }

      for (let from = 0; from < n; from++) {
        const item = route[from];

        /**
         * Previous của item.
         */
        const previous = from === 0 ? null : route[from - 1];

        /**
         * Next của item.
         */
        const next = from + 1 >= n ? null : route[from + 1];

        /**
         * Cost khi remove item.
         *
         * Trước:
         *
         * previous -> item -> next
         *
         * Sau:
         *
         * previous -> next
         */
        let removeDelta = 0;

        if (previous === null) {
          const oldEdge = getSourceDistance(item);

          if (!Number.isFinite(oldEdge)) {
            continue;
          }

          removeDelta -= oldEdge;
        } else {
          const oldEdge = getOrderDistance(previous, item);

          if (!Number.isFinite(oldEdge)) {
            continue;
          }

          removeDelta -= oldEdge;
        }

        if (next === null) {
          // Không có cạnh item -> next.
        } else {
          const oldEdge = getOrderDistance(item, next);

          if (!Number.isFinite(oldEdge)) {
            continue;
          }

          removeDelta -= oldEdge;
        }

        /**
         * Khi remove item:
         *
         * previous -> next
         */
        if (previous !== null && next !== null) {
          const newEdge = getOrderDistance(previous, next);

          if (!Number.isFinite(newEdge)) {
            continue;
          }

          removeDelta += newEdge;
        }

        for (let to = 0; to <= n - 1; to++) {
          /**
           * Bỏ qua vị trí hiện tại.
           */
          if (to === from || to === from + 1) {
            continue;
          }

          /**
           * Sau khi remove item:
           *
           * routeWithoutItem có n - 1 phần tử.
           *
           * to là vị trí insert trong route mới.
           */
          const targetPrevious =
            to === 0 ? null : route[to < from ? to - 1 : to];

          const targetNext =
            to === n - 1 ? null : route[to < from ? to : to + 1];

          let insertDelta = 0;

          /**
           * previous -> item
           */
          if (targetPrevious === null) {
            const edge = getSourceDistance(item);

            if (!Number.isFinite(edge)) {
              continue;
            }

            insertDelta += edge;
          } else {
            const edge = getOrderDistance(targetPrevious, item);

            if (!Number.isFinite(edge)) {
              continue;
            }

            insertDelta += edge;
          }

          /**
           * item -> next
           */
          if (targetNext !== null) {
            const edge = getOrderDistance(item, targetNext);

            if (!Number.isFinite(edge)) {
              continue;
            }

            insertDelta += edge;
          }

          /**
           * Bỏ cạnh cũ:
           *
           * targetPrevious -> targetNext
           */
          if (targetPrevious !== null && targetNext !== null) {
            const oldEdge = getOrderDistance(targetPrevious, targetNext);

            if (!Number.isFinite(oldEdge)) {
              continue;
            }

            insertDelta -= oldEdge;
          }

          const delta = removeDelta + insertDelta;

          if (delta < -0.01) {
            /**
             * Thực hiện relocate.
             */
            const itemValue = route.splice(from, 1)[0];

            const insertIndex = to > from ? to - 1 : to;

            route.splice(insertIndex, 0, itemValue);

            return true;
          }
        }
      }

      return false;
    };

    /**
     * ============================================================
     * SWAP
     *
     * Đổi:
     *
     * A B C D
     *
     * thành:
     *
     * A C B D
     *
     * Delta O(1).
     * ============================================================
     */

    const improveSwap = (route: number[]): boolean => {
      const n = route.length;

      if (n < 2) {
        return false;
      }

      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = i === 0 ? null : route[i - 1];
          const b = route[i];

          const c = route[j];
          const d = j + 1 < n ? route[j + 1] : null;

          /**
           * ======================================================
           * Trường hợp i và j kề nhau:
           *
           * A -> B -> C -> D
           *
           * swap B/C:
           *
           * A -> C -> B -> D
           * ======================================================
           */
          if (j === i + 1) {
            const old1 =
              a === null ? getSourceDistance(b) : getOrderDistance(a, b);

            const old2 = getOrderDistance(b, c);

            const old3 = d === null ? 0 : getOrderDistance(c, d);

            if (
              !Number.isFinite(old1) ||
              !Number.isFinite(old2) ||
              !Number.isFinite(old3)
            ) {
              continue;
            }

            const new1 =
              a === null ? getSourceDistance(c) : getOrderDistance(a, c);

            const new2 = getOrderDistance(c, b);

            const new3 = d === null ? 0 : getOrderDistance(b, d);

            if (
              !Number.isFinite(new1) ||
              !Number.isFinite(new2) ||
              !Number.isFinite(new3)
            ) {
              continue;
            }

            const oldCost = old1 + old2 + old3;

            const newCost = new1 + new2 + new3;

            if (newCost + 0.01 < oldCost) {
              route[i] = c;
              route[j] = b;

              return true;
            }

            continue;
          }

          /**
           * ======================================================
           * Trường hợp không kề nhau:
           *
           * A -> B -> X -> C -> D
           *
           * swap B/C:
           *
           * A -> C -> X -> B -> D
           * ======================================================
           */

          const x = route[i + 1];
          const y = route[j - 1];

          const oldEdges = [
            a === null ? getSourceDistance(b) : getOrderDistance(a, b),

            getOrderDistance(b, x),

            getOrderDistance(y, c),

            d === null ? 0 : getOrderDistance(c, d),
          ];

          if (oldEdges.some((distance) => !Number.isFinite(distance))) {
            continue;
          }

          const newEdges = [
            a === null ? getSourceDistance(c) : getOrderDistance(a, c),

            getOrderDistance(c, x),

            getOrderDistance(y, b),

            d === null ? 0 : getOrderDistance(b, d),
          ];

          if (newEdges.some((distance) => !Number.isFinite(distance))) {
            continue;
          }

          const oldCost = oldEdges[0] + oldEdges[1] + oldEdges[2] + oldEdges[3];

          const newCost = newEdges[0] + newEdges[1] + newEdges[2] + newEdges[3];

          if (newCost + 0.01 < oldCost) {
            route[i] = c;
            route[j] = b;

            return true;
          }
        }
      }

      return false;
    };

    /**
     * ============================================================
     * LOCAL SEARCH
     * ============================================================
     *
     * Không chạy 2-opt một lần duy nhất.
     *
     * Một relocate có thể tạo ra cơ hội 2-opt mới.
     *
     * Vì vậy:
     *
     * 2-opt
     *   ↓
     * relocate
     *   ↓
     * 2-opt
     *   ↓
     * swap
     *   ↓
     * 2-opt
     *
     * cho đến khi không cải thiện.
     */

    const optimizeRoute = (initialRoute: number[]): number[] => {
      const route = [...initialRoute];

      for (
        let iteration = 0;
        iteration < MAX_LOCAL_SEARCH_ITERATIONS;
        iteration++
      ) {
        let improved = false;

        /**
         * 2-opt trước.
         */
        while (improve2Opt(route)) {
          improved = true;
        }

        /**
         * Relocate.
         */
        while (improveRelocate(route)) {
          improved = true;

          /**
           * Relocate có thể tạo ra
           * cơ hội 2-opt mới.
           */
          while (improve2Opt(route)) {
            improved = true;
          }
        }

        /**
         * Swap.
         */
        while (improveSwap(route)) {
          improved = true;

          while (improve2Opt(route)) {
            improved = true;
          }
        }

        if (!improved) {
          break;
        }
      }

      return route;
    };

    /**
     * ============================================================
     * BUILD INITIAL SOLUTIONS
     * ============================================================
     */

    const initialRoutes: number[][] = [];

    /**
     * Route 1:
     * Standard NN.
     */
    const standardRoute = buildNearestNeighbor();

    if (standardRoute) {
      initialRoutes.push(standardRoute);
    }

    /**
     * Route 2:
     * Farthest insertion.
     */
    const farthestRoute = buildFarthestInsertion();

    if (farthestRoute) {
      initialRoutes.push(farthestRoute);
    }

    /**
     * Multi-start NN.
     *
     * Ép từng điểm làm first order.
     *
     * Với <= 100 order:
     * mỗi first order tạo một góc nhìn khác.
     */
    const maxForcedStarts = Math.min(orderCount, INITIAL_ROUTE_COUNT);

    for (let first = 0; first < maxForcedStarts; first++) {
      const route = buildNearestNeighbor(first, 0);

      if (route) {
        initialRoutes.push(route);
      }
    }

    /**
     * Randomized NN.
     *
     * Tạo thêm một số route khác nhau.
     */
    const randomizedCount = Math.min(10, INITIAL_ROUTE_COUNT);

    for (let i = 0; i < randomizedCount; i++) {
      const route = buildNearestNeighbor(null, 0.35);

      if (route) {
        initialRoutes.push(route);
      }
    }

    /**
     * ============================================================
     * OPTIMIZE ALL INITIAL ROUTES
     * ============================================================
     */

    let bestRoute: number[] | null = null;
    let bestDistance = Infinity;

    /**
     * Deduplicate route theo chuỗi index.
     */
    const seenRoutes = new Set<string>();

    for (const initialRoute of initialRoutes) {
      const key = initialRoute.join(',');

      if (seenRoutes.has(key)) {
        continue;
      }

      seenRoutes.add(key);

      const initialDistance = calculateRouteDistance(initialRoute);

      if (!Number.isFinite(initialDistance)) {
        continue;
      }

      const optimizedRoute = optimizeRoute(initialRoute);

      const optimizedDistance = calculateRouteDistance(optimizedRoute);

      if (optimizedDistance < bestDistance) {
        bestDistance = optimizedDistance;
        bestRoute = optimizedRoute;
      }
    }

    /**
     * ============================================================
     * FINAL SAFETY CHECK
     * ============================================================
     */

    if (
      !bestRoute ||
      bestRoute.length !== orderCount ||
      !Number.isFinite(bestDistance)
    ) {
      throw new Error('Cannot find reachable route for all orders');
    }

    /**
     * Tính lại một lần cuối từ matrix.
     */
    const totalDistance = calculateRouteDistance(bestRoute);

    /**
     * ============================================================
     * RESULT
     * ============================================================
     */

    const orders = bestRoute.map((orderIndex, index) => ({
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
