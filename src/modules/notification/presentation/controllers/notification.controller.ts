import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtAuthGuard } from '@/core/security/jwt-auth.guard';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { Controller, Sse, UseGuards } from '@nestjs/common';
import { filter, map, Observable } from 'rxjs';
import { NotificationService } from '../../domain/services/notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse('stream')
  sse(@AuthPayload() authPayload: JwtPayload): Observable<MessageEvent> {
    return this.notificationService.getNotificationStream().pipe(
      filter((item) => item.userId === authPayload.userId),
      map(
        (item) =>
          ({
            data: item.data,
          }) as MessageEvent,
      ),
    );
  }
}
