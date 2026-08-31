import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetDeliveryOrdersQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;
}

export class GetDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}
