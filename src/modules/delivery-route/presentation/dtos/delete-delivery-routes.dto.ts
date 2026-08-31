import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeliveryRoutesBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  deliveryRouteIds: string[];
}
