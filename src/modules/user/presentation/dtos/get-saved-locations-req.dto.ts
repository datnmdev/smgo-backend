import { IsOptional, IsString } from "class-validator";

export class GetSavedLocaitonsQueryDto {
  @IsOptional()
  @IsString()
  keyword: string;
}