import { UserModel } from '@/modules/user/data/models/user.model';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('payment_transaction_pkey', ['id'], { unique: true })
@Entity('payment_transaction', { schema: 'public' })
export class PaymentTransactionModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('text', { name: 'order_id' })
  orderId: string;

  @Column('enum', {
    name: 'product_id',
    enum: ['smgo_basic', 'smgo_standard', 'smgo_plus', 'smgo_premium'],
  })
  productId: 'smgo_basic' | 'smgo_standard' | 'smgo_plus' | 'smgo_premium';

  @Column('text', { name: 'purchase_token' })
  purchaseToken: string;

  @Column('character varying', { name: 'price_currency', length: 50 })
  priceCurrency: string;

  @Column('numeric', { name: 'amount', precision: 18, scale: 3 })
  amount: string;

  @Column('json', { name: 'raw_payload' })
  rawPayload: object;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('enum', {
    name: 'event_type',
    enum: [
      'SUBSCRIPTION_RECOVERED',
      'SUBSCRIPTION_RENEWED',
      'SUBSCRIPTION_CANCELED',
      'SUBSCRIPTION_PURCHASED',
      'SUBSCRIPTION_ON_HOLD',
      'SUBSCRIPTION_IN_GRACE_PERIOD',
      'SUBSCRIPTION_RENEWAL_RESTORED',
      'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED',
      'SUBSCRIPTION_DEFERRED',
      'SUBSCRIPTION_PAUSED',
      'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED',
      'SUBSCRIPTION_REVOKED',
      'SUBSCRIPTION_EXPIRED',
      'SUBSCRIPTION_PENDING_PURCHASE_CANCELED',
      'UNKNOWN',
    ],
  })
  eventType:
    | 'SUBSCRIPTION_RECOVERED'
    | 'SUBSCRIPTION_RENEWED'
    | 'SUBSCRIPTION_CANCELED'
    | 'SUBSCRIPTION_PURCHASED'
    | 'SUBSCRIPTION_ON_HOLD'
    | 'SUBSCRIPTION_IN_GRACE_PERIOD'
    | 'SUBSCRIPTION_RENEWAL_RESTORED'
    | 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED'
    | 'SUBSCRIPTION_DEFERRED'
    | 'SUBSCRIPTION_PAUSED'
    | 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED'
    | 'SUBSCRIPTION_REVOKED'
    | 'SUBSCRIPTION_EXPIRED'
    | 'SUBSCRIPTION_PENDING_PURCHASE_CANCELED'
    | 'UNKNOWN';

  @ManyToOne(() => UserModel, (user) => user.paymentTransactions)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UserModel;
}
