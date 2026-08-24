import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetLocationSuggestionsQueryRequestDto {
  @IsOptional()
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  address: string;
}
