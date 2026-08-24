import { IsNotEmpty, IsString } from 'class-validator';

export class ExtractOrderInfoQueryDto {
  @IsNotEmpty()
  @IsString()
  ocrText: string;
}
