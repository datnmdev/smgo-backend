import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenBodyDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
