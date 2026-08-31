import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteLocationsBodyReqDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  locationIds: string[];
}
