import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetLatestAppVersionQueryReqDto {
  @IsNotEmpty()
  @IsString()
  platform: string;

  @IsNotEmpty()
  @Matches(/^[a-z]{2}[-_][A-Z]{2}$/)
  locale: string;
}
