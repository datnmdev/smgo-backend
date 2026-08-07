import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Point {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export class UpdateSavedLocationBodyReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactName: string;

  @IsOptional()
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Type(() => Point)
  @ValidateNested()
  location?: Point;
}

export class UpdateSavedLocationParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
