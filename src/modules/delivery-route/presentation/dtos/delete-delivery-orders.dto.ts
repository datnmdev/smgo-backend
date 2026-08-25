import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}

export class DeleteDeliveryOrdersBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  deliveryOrderIds: string[];
}
