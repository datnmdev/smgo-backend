import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRouteBodyReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
