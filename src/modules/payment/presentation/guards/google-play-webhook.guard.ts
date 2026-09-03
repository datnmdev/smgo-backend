import { ConfigService } from '@/core/config/config.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GooglePlayWebhookAuthGuard implements CanActivate {
  private readonly authClient = new OAuth2Client();

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const [, token] = authHeader.split(' ');
    const expectedAudience =
      this.configService.googleSubscriptionConfig().pubsubVerificationAudience;
    if (!expectedAudience) {
      throw new UnauthorizedException();
    }
    try {
      const ticket = await this.authClient.verifyIdToken({
        idToken: token,
        audience: expectedAudience,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email_verified) {
        throw new UnauthorizedException();
      }
      request['pubsubPayload'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
