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
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getMinioConfig(),
    }),
    AuthModule,
    UserModule,
    DeliveryRouteModule,
    AppVersionModule,
    StorageModule,
    AiModule
  ],
})
export class AppModule {}
