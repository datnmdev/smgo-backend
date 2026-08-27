import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryRouteBodyReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsIn(['pending', 'sorting', 'delivering', 'completed'])
  status: 'pending' | 'sorting' | 'delivering' | 'completed';
}

export class UpdateDeliveryRouteParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
