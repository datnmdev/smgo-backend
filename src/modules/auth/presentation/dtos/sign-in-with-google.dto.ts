import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithGoogleBodyReqDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
