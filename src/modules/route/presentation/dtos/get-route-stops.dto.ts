import { Point } from '@/@types/modules/user/domain/models/saved-location';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetRouteStopsQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  routeId: string;
}

export class GetRouteStopsResDto {
  id: string;
  orderCode: string;
  orderName: string | null;
  sequenceOrder: number | null;
  status: 'pending' | 'delivered' | 'cancelled';
  contactName: string | null;
  contactPhone: string;
  address: string;
  location: Point | null;
  appliedLocation: string | null;
  routeId: string;
  startedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  @Exclude()
  deletedAt: Date | null;
}
