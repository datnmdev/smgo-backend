import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SubscriptionNotificationDto {
  @IsString()
  @IsNotEmpty()
  version: string;

  @IsInt()
  @IsNotEmpty()
  notificationType: number;

  @IsString()
  @IsNotEmpty()
  purchaseToken: string;

  @IsString()
  @IsNotEmpty()
  subscriptionId: string;
}

export class DeveloperNotificationDto {
  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsString()
  @IsNotEmpty()
  eventTimeMillis: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionNotificationDto)
  subscriptionNotification?: SubscriptionNotificationDto;
}

export class GooglePlayWebhookMessageDto {
  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsNotEmpty()
  publishTime: string;
}

export class GooglePlayWebhookBodyDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => GooglePlayWebhookMessageDto)
  message: GooglePlayWebhookMessageDto;

  @IsString()
  @IsNotEmpty()
  subscription: string;
}
