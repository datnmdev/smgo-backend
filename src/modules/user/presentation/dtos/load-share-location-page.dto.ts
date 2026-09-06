import { IsNotEmpty, IsString } from 'class-validator';

export class LoadShareLocationPageQueryReqDto {
  @IsNotEmpty()
  @IsString()
  tokenKey: string;
}
