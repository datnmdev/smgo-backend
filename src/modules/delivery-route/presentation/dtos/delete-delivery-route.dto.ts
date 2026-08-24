import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeliveryRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
