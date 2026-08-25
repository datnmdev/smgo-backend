import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

export class ConfirmDeliveryOrdersBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  deliveryOrderIds: string[];
}
