import { Module } from '@nestjs/common';
import { NotificationService } from './domain/services/notification.service';
import { NotificationController } from './presentation/controllers/notification.controller';
import { ConfigModule } from '@/core/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
