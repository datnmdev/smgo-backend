import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithFacebookBodyReqDto {
  @IsNotEmpty()
  @IsString()
  inputToken: string;
}
