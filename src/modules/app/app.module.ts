import { ConfigModule } from '@/core/config/config.module';
import { ConfigService } from '@/core/config/config.service';
import { RedisCoreModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AppVersionModule } from '../app-version/app-version.module';
import { NestMinioModule } from 'nestjs-minio';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { DeliveryRouteModule } from '../delivery-route/delivery-route.module';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.getPostgreSQLConfig() as TypeOrmModuleAsyncOptions,
      inject: [ConfigService],
    }),
    RedisCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getRedisConfig() as RedisModuleOptions,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getRedisConfig().url,
        },
      }),
    }),
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getMinioConfig(),
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'extract-order-info',
      adapter: BullMQAdapter,
    }),
    AuthModule,
    UserModule,
    DeliveryRouteModule,
    AppVersionModule,
    StorageModule,
    AiModule,
    NotificationModule
  ],
})
export class AppModule {}
