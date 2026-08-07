import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetRoutesQueryReqDto {
  @IsOptional()
  @IsString()
  keyword: string;
}

export class GetRoutesResDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
