import { IsNotEmpty, IsString } from "class-validator";

export class GetLatestAppVersionQueryReqDto {
  @IsNotEmpty()
  @IsString()
  platform: string;
}