import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRouteBodyReqDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class UpdateRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
