import { androidpublisher_v3 } from 'googleapis';
import {
  SubscriptionProductId,
  SubscriptionStatus,
  TSubscription,
} from '../entities/subscription.entity';

export type Platform = 'android';

export abstract class SubscriptionRepository {
  abstract verify(
    platform: Platform,
    purchaseToken: string,
  ): Promise<VerifySubscriptionResult<AndroidTransaction>>;
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
  abstract getGoogleSubscriptionInfo(
    packageName: string,
    token: string,
  ): Promise<androidpublisher_v3.Schema$SubscriptionPurchaseV2>;
  abstract acknowledgeAndroidPurchase(purchaseToken: string): Promise<void>;
}

export interface FindSubscriptionsByQuery {
  userId?: string;
  purchaseToken?: string;
}

export type AndroidTransaction = {
  orderId: string;
  productId: SubscriptionProductId;
  purchaseToken: string;
  priceCurrency: string;
  amount: number;
  rawPayload: androidpublisher_v3.Schema$SubscriptionPurchaseV2;
};

export type VerifySubscriptionResult<TTransaction> = {
  transaction: TTransaction;
  subscription: {
    platform: string;
    productId: SubscriptionProductId;
    purchaseToken: string;
    startsAt: Date;
    expiresAt: Date;
    isAutoRenew: boolean;
  };
};

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
