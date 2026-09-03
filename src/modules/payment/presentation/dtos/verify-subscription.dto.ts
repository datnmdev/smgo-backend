import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class VerifySubscriptionBodyReqDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['android'])
  platform: 'android';

  @IsString()
  @IsNotEmpty()
  purchaseToken: string;
}
