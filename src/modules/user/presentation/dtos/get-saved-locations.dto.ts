import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetSavedLocationsQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;
}

export class GetSavedLocationsResDto {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string | object | null;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
