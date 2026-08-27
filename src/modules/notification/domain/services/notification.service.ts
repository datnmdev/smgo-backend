import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';
import Redis from 'ioredis';
import { ConfigService } from '@/core/config/config.service';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private redisPublisher: Redis;
  private redisSubscriber: Redis;

  private readonly notificationSubject = new Subject<{
    userId: string;
    data: any;
  }>();

  constructor(private readonly configService: ConfigService) {
    const redisConfig = {
      host: configService.getRedisConfig().host,
      port: configService.getRedisConfig().port,
    };
    this.redisPublisher = new Redis(redisConfig);
    this.redisSubscriber = new Redis(redisConfig);
  }

  async onModuleInit() {
    await this.redisSubscriber.subscribe('notifications');
    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'notifications') {
        const parsedMessage = JSON.parse(message);
        this.notificationSubject.next(parsedMessage);
      }
    });
  }

  async onModuleDestroy() {
    await this.redisPublisher.quit();
    await this.redisSubscriber.quit();
  }

  async sendNotification<TNotificationPayload = NotificationPayload>(
    userId: string,
    payload: TNotificationPayload,
  ) {
    const message = JSON.stringify({ userId, data: payload });
    await this.redisPublisher.publish('notifications', message);
  }

  getNotificationStream() {
    return this.notificationSubject.asObservable();
  }
}

export interface NotificationPayload<TData = any> {
  type: 'extract-order-info';
  data: TData;
}
