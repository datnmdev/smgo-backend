import { JwtPayload, JwtTokens } from '@/@types/jwt';
import { AppResponse } from '@/@types/core/class/response';
import { AppResponse as CAppResponse } from '@/core/class/response.class';
import { Body, Controller, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import { SignInWithGoogleBodyDto } from '../dtos/sign-in-with-google.dto';
import { SignInWithGoogleUsecase } from '../../domain/usecases/sign-in-with-google.usecase';
import { SignInWithFacebookUsecase } from '../../domain/usecases/sign-in-with-facebook.usecase';
import { SignInWithFacebookBodyDto } from '../dtos/sign-in-with-facebook.dto';
import { SignOutUsecase } from '../../domain/usecases/sign-out.usecase';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { DeviceInfo } from '@/@types/modules/auth/domain/repositories/session.repository';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { RefreshTokenBodyDto } from '../dtos/refresh-token.dto';
import { RefreshTokenUsecase } from '../../domain/usecases/refresh-token.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInWithGoogleUsecase: SignInWithGoogleUsecase,
    private readonly signInWithFacebookUsecase: SignInWithFacebookUsecase,
    private readonly signOutUsecase: SignOutUsecase,
    private readonly refreshTokenUsecase: RefreshTokenUsecase,
  ) {}

  @Post('oauth/google')
  async signInWithGoogle(
    @Body() signInWithGoogleBody: SignInWithGoogleBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AppResponse<JwtTokens>> {
    const deviceInfo: DeviceInfo = {
      ip,
      userAgent,
    };
    return CAppResponse.ok(
      await this.signInWithGoogleUsecase.execute(
        signInWithGoogleBody.idToken,
        deviceInfo,
      ),
    );
  }

  @Post('oauth/facebook')
  async signInWithFacebook(
    @Body() signInWithFacebookBody: SignInWithFacebookBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AppResponse<JwtTokens>> {
    const deviceInfo: DeviceInfo = {
      ip,
      userAgent,
    };
    return CAppResponse.ok(
      await this.signInWithFacebookUsecase.execute(
        signInWithFacebookBody.inputToken,
        deviceInfo,
      ),
    );
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  async signOut(
    @AuthPayload() payload: JwtPayload,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(await this.signOutUsecase.execute(payload));
  }

  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenBody: RefreshTokenBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AppResponse<JwtTokens>> {
    const deviceInfo: DeviceInfo = {
      ip,
      userAgent,
    };
    return CAppResponse.ok(
      await this.refreshTokenUsecase.execute(
        refreshTokenBody.refreshToken,
        deviceInfo,
      ),
    );
  }
}
