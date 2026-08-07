import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenBodyReqDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
