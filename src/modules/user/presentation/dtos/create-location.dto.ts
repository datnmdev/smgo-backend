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

export class CreateLocationBodyReqDto {
  @IsNotEmpty()
  @IsString()
  locationName: string;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
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
