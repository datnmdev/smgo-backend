import { PaginationQueryReqDto } from '@/core/common/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class GetLocationsQueryReqDto extends PaginationQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  id: string;
}
