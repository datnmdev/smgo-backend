import { IsNotEmpty, IsString } from "class-validator";

export class SortDeliveryOrdersParamsReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;
}