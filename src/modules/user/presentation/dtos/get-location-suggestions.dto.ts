import { PaginationQueryReqDto } from '@/core/common/pagination.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetLocationSuggestionsQueryRequestDto extends PaginationQueryReqDto {
  @IsOptional()
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  address: string;
}
