export type SubscriptionProductId =
  'smgo_basic' | 'smgo_standard' | 'smgo_plus' | 'smgo_premium';

export type SubscriptionStatus =
  'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'IN_GRACE_PERIOD' | 'ON_HOLD';

export interface TSubscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  productId: SubscriptionProductId;
  purchaseToken: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  autoRenew: boolean | null;
}
