import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationReq {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}

export class PaginationRes<T> {
  data: T[];
  meta: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
  };
}
