import {
  TEventType,
  TPaymentTransaction,
} from '../entities/payment-transaction.entity';
import { SubscriptionProductId } from '../entities/subscription.entity';

export abstract class PaymentTransactionRepository {
  abstract createPaymentTransaction(
    data: CreatePaymentTransactionData,
    manager?: any,
  ): Promise<TPaymentTransaction>;
}

export interface CreatePaymentTransactionData {
  userId: string;
  orderId: string;
  productId: SubscriptionProductId;
  purchaseToken: string;
  eventType: TEventType;
  priceCurrency: string;
  amount: string;
  rawPayload: object;
}
