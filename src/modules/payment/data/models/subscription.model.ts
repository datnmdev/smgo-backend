import { UserModel } from '@/modules/user/data/models/user.model';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('subscription_pkey', ['id'], { unique: true })
@Entity('subscription', { schema: 'public' })
export class SubscriptionModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('enum', {
    name: 'product_id',
    enum: ['smgo_basic', 'smgo_standard', 'smgo_plus', 'smgo_premium'],
  })
  productId: 'smgo_basic' | 'smgo_standard' | 'smgo_plus' | 'smgo_premium';

  @Column('text', { name: 'purchase_token', nullable: true })
  purchaseToken: string | null;

  @Column('timestamp with time zone', { name: 'starts_at', nullable: true })
  startsAt: Date | null;

  @Column('timestamp with time zone', { name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column('boolean', { name: 'auto_renew', nullable: true })
  autoRenew: boolean | null;

  @Column('enum', {
    name: 'status',
    enum: ['ACTIVE', 'CANCELED', 'EXPIRED', 'ON_HOLD', 'IN_GRACE_PERIOD'],
  })
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'IN_GRACE_PERIOD' | 'ON_HOLD';

  @ManyToOne(() => UserModel, (user) => user.subscriptions)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UserModel;
}
