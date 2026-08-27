import { PaginationQueryReqDto } from '@/core/common/pagination.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetDeliveryRoutesQueryReqDto extends PaginationQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsIn(['completed', 'delivering', 'pending', 'sorting'])
  status: 'completed' | 'delivering' | 'pending' | 'sorting';
}
