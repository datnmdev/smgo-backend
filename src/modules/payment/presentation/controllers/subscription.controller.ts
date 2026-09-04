import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { VerifySubscriptionUsecase } from '../../domain/usecases/verify-subscription.usecase';
import { AppResponse } from '@/core/common/response.dto';
import { JwtAuthGuard } from '@/core/security/jwt-auth.guard';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { VerifySubscriptionBodyReqDto } from '../dtos/verify-subscription.dto';
import { GetCurrentSubscriptionUsecase } from '../../domain/usecases/get-current-subscription.usecase';
import { plainToInstance } from 'class-transformer';
import { GetCurrentSubscriptionResDataDto } from '../dtos/get-current-subscription.dto';
import { GooglePlayWebhookAuthGuard } from '../guards/google-play-webhook.guard';
import { GooglePlayWebhookBodyDto } from '../dtos/handle-google-play-webhook.dto';
import { HandleGooglePlayWebhookUsecase } from '../../domain/usecases/handle-google-play-webhook.usecase';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly verifySubscriptionUsecase: VerifySubscriptionUsecase,
    private readonly getCurrentSubscriptionUsecase: GetCurrentSubscriptionUsecase,
    private readonly handleGooglePlayWebhookUsecase: HandleGooglePlayWebhookUsecase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifySubscription(
    @AuthPayload() authPayload: JwtPayload,
    @Body() verifySubscriptionBody: VerifySubscriptionBodyReqDto,
  ) {
    return AppResponse.ok(
      await this.verifySubscriptionUsecase.execute(
        authPayload.userId,
        verifySubscriptionBody.platform,
        verifySubscriptionBody.purchaseToken,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentSubscription(
    @AuthPayload() authPayload: JwtPayload,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      plainToInstance(
        GetCurrentSubscriptionResDataDto,
        await this.getCurrentSubscriptionUsecase.execute(authPayload.userId),
      ),
    );
  }

  @UseGuards(GooglePlayWebhookAuthGuard)
  @Post('webhooks/google-play')
  async handleGooglePlayWebhook(@Body() body: GooglePlayWebhookBodyDto) {
    return AppResponse.ok(
      await this.handleGooglePlayWebhookUsecase.execute(body.message.data),
    );
  }
}
