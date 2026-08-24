import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  getJwtConfig() {
    return {
      jwtSecret: this.nestConfigService.get('JWT_SECRET'),
    };
  }

  getPostgreSQLConfig() {
    return {
      type: 'postgres',
      host: this.nestConfigService.get('DB_HOST'),
      port: Number(this.nestConfigService.get('DB_PORT')),
      username: this.nestConfigService.get('DB_USER'),
      password: this.nestConfigService.get('DB_PASS'),
      database: this.nestConfigService.get('DB_NAME'),
      entities: ['dist/**/models/*.{ts,js}'],
      synchronize: false,
    };
  }

  getRedisConfig() {
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

  getMinioConfig() {
    return {
      endPoint: this.nestConfigService.get('MINIO_ENDPOINT'),
      port: Number(this.nestConfigService.get('MINIO_PORT')),
      useSSL: false,
      accessKey: this.nestConfigService.get('MINIO_ACCESS_KEY'),
      secretKey: this.nestConfigService.get('MINIO_SECRET_KEY'),
      bucket: this.nestConfigService.get('MINIO_BUCKET'),
      region: this.nestConfigService.get('MINIO_REGION'),
    };
  }

  getAiConfig() {
    return {
      llama: {
        url: this.nestConfigService.get('LLAMA_URL'),
      },
    };
  }
}
