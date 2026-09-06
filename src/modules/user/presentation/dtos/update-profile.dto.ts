import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileBodyReqDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
