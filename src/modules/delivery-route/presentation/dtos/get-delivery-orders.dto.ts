import { IsOptional, IsString } from 'class-validator';

export class GetDeliveryOrdersQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  deliveryRouteId: string;
}
