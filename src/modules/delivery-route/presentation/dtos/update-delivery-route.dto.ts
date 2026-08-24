import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryRouteBodyReqDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class UpdateDeliveryRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
