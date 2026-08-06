import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  getJwtConfig() {
    return {
      jwtSecret: this.nestConfigService.get('JWT_SECRET'),
    };
  }

  getPostgreSQLConfig(): TypeOrmModuleAsyncOptions {
    return {
      useFactory: () => ({
        type: 'postgres',
        host: this.nestConfigService.get('DB_HOST'),
        port: Number(this.nestConfigService.get('DB_PORT')),
        username: this.nestConfigService.get('DB_USER'),
        password: this.nestConfigService.get('DB_PASS'),
        database: this.nestConfigService.get('DB_NAME'),
        entities: ['dist/**/entities/*.{ts,js}'],
        synchronize: false,
      }),
    };
  }

  getRedisConfig(): RedisModuleOptions {
    return {
      type: 'single',
      url: `redis://:${this.nestConfigService.get('REDIS_PASS')}@${this.nestConfigService.get('REDIS_HOST')}:${Number(this.nestConfigService.get('REDIS_PORT'))}`,
    };
  }

  getGoogleOAuthConfig() {
    return {
      clientId: this.nestConfigService.get('GOOGLE_OAUTH_CLIENT_ID'),
    };
  }

  getFacebookOAuthConfig() {
    return {
      appId: this.nestConfigService.get('FACEBOOK_APP_ID'),
      appSecret: this.nestConfigService.get('FACEBOOK_APP_SECRET'),
    };
  }
}
