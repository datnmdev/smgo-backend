import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRouteBodyReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  orderMediaId?: string | null;
}

export class UpdateRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
