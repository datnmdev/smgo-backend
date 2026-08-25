import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RecheckDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

export class RecheckDeliveryOrdersBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  deliveryOrderIds: string[];
}
