import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteSavedLocationParamsReqDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
