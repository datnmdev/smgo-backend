import { Point } from '@/@types/modules/user/domain/models/saved-location';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRouteStopBodyReqDto {
  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsString()
  orderName?: string | null;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  contactName?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: Point | null;

  @IsOptional()
  @IsString()
  appliedLocation?: string | null;
}

export class UpdateRouteStopParamsReqDto {
  @IsNotEmpty()
  @IsString()
  routeId: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}
