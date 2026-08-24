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
  @IsIn(['completed', 'in_progress', 'pending', 'sorting'])
  status: 'completed' | 'in_progress' | 'pending' | 'sorting';
}
