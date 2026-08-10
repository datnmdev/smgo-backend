import { ConfigModule } from '@/core/config/config.module';
import { ConfigService } from '@/core/config/config.service';
import { RedisCoreModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RouteModule } from '../route/route.module';
import { AppVersionModule } from '../app-version/app-version.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.getPostgreSQLConfig().useFactory(),
      inject: [ConfigService],
    }),
    RedisCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.getRedisConfig();
      },
    }),
    AuthModule,
    UserModule,
    RouteModule,
    AppVersionModule
  ],
})
export class AppModule {}
