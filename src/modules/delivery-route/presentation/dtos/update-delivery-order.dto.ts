import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PointDto {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export class UpdateDeliveryOrderBodyReqDto {
  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsString()
  orderName?: string | null;

  @IsOptional()
  @IsString()
  orderMediaId?: string | null;

  @IsOptional()
  @IsIn([
    'pending',
    'checked',
    'sorted',
    'delivered',
    'cancelled',
    'rescheduled',
  ])
  status?:
    | 'pending'
    | 'checked'
    | 'sorted'
    | 'delivered'
    | 'cancelled'
    | 'rescheduled';

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => PointDto)
  @ValidateNested()
  location?: PointDto;

  @IsOptional()
  @IsString()
  appliedLocationId?: string | null;
}

export class UpdateDeliveryOrderParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;

  @IsNotEmpty()
  @IsString()
  deliveryOrderId: string;
}
