import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateDeliveryOrderParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

class PointDto {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export class CreateDeliveryOrderBodyReqDto {
  @IsOptional()
  @IsString()
  orderMediaId?: string | null;

  @IsNotEmpty()
  @IsString()
  orderCode: string;

  @IsOptional()
  @IsString()
  orderName?: string | null;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @Type(() => PointDto)
  @ValidateNested()
  location: PointDto;

  @IsOptional()
  @IsString()
  appliedLocationId?: string | null;
}
