import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmSortedDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

export class ConfirmSortedDeliveryOrdersBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  deliveryOrderIds: string[];
}
