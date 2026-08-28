import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class Point {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export class SortDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

export class SortDeliveryOrdersBodyReqDto {
  @IsNotEmpty()
  @Type(() => Point)
  @ValidateNested()
  source: Point;
}
