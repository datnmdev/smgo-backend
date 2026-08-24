import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteLocationParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
