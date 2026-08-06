import { JwtToken } from '@/@types/jwt';
import { AppResponse } from '@/@types/core/class/response';
import { AppResponse as CAppResponse } from '@/core/class/response.class';
import { Body, Controller, Post } from '@nestjs/common';
import { SignInWithGoogleBodyDto } from '../dtos/sign-in-with-google.dto';
import { SignInWithGoogleUsecase } from '../../domain/usecases/sign-in-with-google.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInWithGoogleUsecase: SignInWithGoogleUsecase,
  ) {}

  @Post('oauth/google')
  async signInWithGoogle(
    @Body() signInWithGoogleBody: SignInWithGoogleBodyDto,
  ): Promise<AppResponse<JwtToken>> {
    return CAppResponse.ok(
      await this.signInWithGoogleUsecase.execute(signInWithGoogleBody.idToken),
    );
  }
}
