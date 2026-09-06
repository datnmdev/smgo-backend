import { TCoordinate } from '../entities/location.entity';
import { TShareLocationPayload } from '../entities/share-location.entity';

export abstract class ShareLocationTokenRepository {
  abstract createTokenKey(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderId: string,
  ): Promise<string>;
  abstract verify(tokenKey: string): Promise<TShareLocationPayload>;
  abstract saveShareLocation(
    tokenKey: string,
    coordinate: TCoordinate,
  ): Promise<void>;
  abstract getShareLocation(tokenKey: string): Promise<TCoordinate | null>;
}
