import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeliveryRouteBodyReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
