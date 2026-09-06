import { IsNotEmpty, IsString } from 'class-validator';

export class GetShareLocationQueryReqDto {
  @IsNotEmpty()
  @IsString()
  tokenKey: string;
}
