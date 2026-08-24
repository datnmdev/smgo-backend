import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PointDto {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;
}

export class UpdateLocationBodyReqDto {
  @IsOptional()
  @IsString()
  locationName: string;

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
  @Type(() => PointDto)
  @ValidateNested()
  location?: PointDto;
}

export class UpdateLocationParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
