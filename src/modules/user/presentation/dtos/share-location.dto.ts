import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ShareLocationQueryReqDto {
  @IsNotEmpty()
  @IsString()
  tokenKey: string;
}

export class ShareLocationBodyReqDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;
}
