import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRouteStopParamsReqDto {
  @IsNotEmpty()
  @IsString()
  routeId: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}
