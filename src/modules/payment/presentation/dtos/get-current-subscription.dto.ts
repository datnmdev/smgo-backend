import { Exclude } from 'class-transformer';

export class GetCurrentSubscriptionResDataDto {
  id: string;

  userId: string;

  status: string;

  productId: string;

  @Exclude()
  purchaseToken: string | null;

  startsAt: Date | null;

  expiresAt: Date | null;

  autoRenew: boolean | null;
}
