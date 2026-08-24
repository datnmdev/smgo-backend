import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryReqDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
