import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
