import { Type } from 'class-transformer';
import {
  IsArray,
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

export class OrderBodyReqDto {
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

export class CreateDeliveryRouteWithOrdersBodyReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => OrderBodyReqDto)
  @IsArray()
  @ValidateNested({ each: true })
  orders: OrderBodyReqDto[];
}
