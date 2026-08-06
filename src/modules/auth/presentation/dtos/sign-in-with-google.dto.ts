import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithGoogleBodyDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
