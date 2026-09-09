import { AppVersionModel } from '@/modules/app-version/data/models/app-version.model';
import { DeliveryOrderModel } from '@/modules/delivery-route/data/models/delivery-order.model';
import { DeliveryRouteModel } from '@/modules/delivery-route/data/models/delivery-route.model';
import { PaymentTransactionModel } from '@/modules/payment/data/models/payment-transaction.model';
import { SubscriptionModel } from '@/modules/payment/data/models/subscription.model';
import { MediaModel } from '@/modules/storage/data/models/media.model';
import { LocationModel } from '@/modules/user/data/models/location.model';
import { UserModel } from '@/modules/user/data/models/user.model';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  getServerConfig() {
    return {
      serverBaseUrl: this.nestConfigService.get('SERVER_BASE_URL'),
    };
  }

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
      entities: [
        UserModel,
        LocationModel,
        DeliveryRouteModel,
        DeliveryOrderModel,
        MediaModel,
        AppVersionModel,
        SubscriptionModel,
        PaymentTransactionModel
      ],
      synchronize: false,
    };
  }

  getRedisConfig() {
    return {
      type: 'single',
      options: {
        host: this.nestConfigService.get<string>('REDIS_HOST'),
        port: Number(this.nestConfigService.get<string>('REDIS_PORT')),
        password: this.nestConfigService.get<string>('REDIS_PASS'),
      },
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

  getR2Config() {
    return {
      endPoint: this.nestConfigService.get('R2_ENDPOINT'),
      port: Number(this.nestConfigService.get('R2_PORT')),
      useSSL: true,
      accessKey: this.nestConfigService.get('R2_ACCESS_KEY_ID'),
      secretKey: this.nestConfigService.get('R2_SECRET_ACCESS_KEY'),
      region: 'auto',
      bucket: this.nestConfigService.get('R2_BUCKET'),
    };
  }

  getAiConfig() {
    return {
      qwenBaseUrl: this.nestConfigService.get('QWEN_BASE_URL'),
    };
  }

  getOsrmConfig() {
    return {
      baseUrl: this.nestConfigService.get('OSRM_BASE_URL'),
    };
  }

  googleServiceAccountConfig() {
    return {
      googleServiceAccountFilePath: this.nestConfigService.get(
        'GOOGLE_SERVICE_ACCOUNT_FILE_PATH',
      ),
    };
  }

  googleSubscriptionConfig() {
    return {
      packageName: this.nestConfigService.get('PACKAGE_NAME'),
      pubsubVerificationAudience: this.nestConfigService.get(
        'PUBSUB_VERIFICATION_AUDIENCE',
      ),
    };
  }
}
