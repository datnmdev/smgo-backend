import { IsNotEmpty, IsString } from 'class-validator';

export class GetShareLocationUrlQueryReqDto {
  @IsNotEmpty()
  @IsString()
  deliveryRouteId: string;

  @IsNotEmpty()
  @IsString()
  deliveryOrderId: string;
}
