import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeliveryOrderParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;

  @IsNotEmpty()
  @IsString()
  deliveryOrderId: string;
}
