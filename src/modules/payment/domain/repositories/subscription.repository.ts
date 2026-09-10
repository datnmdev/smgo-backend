import { androidpublisher_v3 } from 'googleapis';
import {
  SubscriptionProductId,
  SubscriptionStatus,
  TSubscription,
} from '../entities/subscription.entity';

export type Platform = 'android';

export abstract class SubscriptionRepository {
  abstract getSubscriptionPurchase(
    platform: Platform,
    purchaseToken: string,
  ): Promise<SubscriptionPurchaseResult<AndroidTransaction>>;
  abstract createSubscription(
    data: CreateSubscriptionData,
    manager?: any,
  ): Promise<TSubscription>;
  abstract updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionData,
    manager?: any,
  ): Promise<void>;
  abstract getSubscriptions(
    query?: FindSubscriptionsByQuery,
  ): Promise<TSubscription[]>;
  abstract acknowledgeAndroidPurchase(
    purchaseToken: string,
    productId: string,
  ): Promise<void>;
}

export interface FindSubscriptionsByQuery {
  userId?: string;
  purchaseToken?: string;
}

export interface SubscriptionPurchaseResult<TTransaction> {
  transaction: TTransaction;

  subscription: {
    platform: Platform;
    productId: SubscriptionProductId | null;
    purchaseToken: string;
    startsAt: Date | null;
    expiresAt: Date | null;
    isAutoRenew: boolean | null;
    state: string | null;
    externalAccountId: string | null;
    outOfAppPurchaseContext: {
      expiredPurchaseToken: string | null;
      expiredExternalAccountId: string | null;
    } | null;
  };
}

export interface AndroidTransaction {
  orderId: string | null;
  productId: SubscriptionProductId | null;
  purchaseToken: string;
  priceCurrency: string | null;
  amount: number | null;
  rawPayload: androidpublisher_v3.Schema$SubscriptionPurchaseV2;
}

export interface CreateSubscriptionData {
  userId: string;
  status: SubscriptionStatus;
  productId: SubscriptionProductId;
  purchaseToken?: string | null;
  startsAt: Date;
  expiresAt?: Date | null;
  autoRenew?: boolean | null;
}

export interface UpdateSubscriptionData {
  status?: SubscriptionStatus;
  productId?: SubscriptionProductId;
  purchaseToken?: string | null;
  startsAt?: Date;
  expiresAt?: Date | null;
  autoRenew?: boolean | null;
}
