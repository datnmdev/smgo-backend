import { Point } from '@/@types/modules/user/domain/models/saved-location';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRouteStopParamsReqDto {
  @IsNotEmpty()
  @IsString()
  routeId: string;
}

export class CreateRouteStopBodyReqDto {
  @IsOptional()
  @IsString()
  orderMediaId?: string | null;

  @IsNotEmpty()
  @IsString()
  orderCode: string;

  @IsOptional()
  @IsString()
  orderName?: string | null;

  @IsOptional()
  @IsString()
  contactName?: string | null;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  location?: Point | null;

  @IsOptional()
  @IsString()
  appliedLocation?: string | null;
}
