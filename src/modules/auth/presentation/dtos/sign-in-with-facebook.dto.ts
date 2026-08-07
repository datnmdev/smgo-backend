import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithFacebookBodyDto {
  @IsNotEmpty()
  @IsString()
  inputToken: string;
}
