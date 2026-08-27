import { Column, Entity, Index, OneToMany } from 'typeorm';
import { DeliveryOrderModel } from './delivery-order.model';

@Index('delivery_route_pkey', ['id'], { unique: true })
@Index('idx_delivery_route__search_vector', ['searchVector'], {})
@Entity('delivery_route', { schema: 'public' })
export class DeliveryRouteModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'name' })
  name: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'sorting', 'delivering', 'completed'],
    default: () => "'pending'",
  })
  status: 'pending' | 'sorting' | 'delivering' | 'completed';

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('tsvector', { name: 'search_vector', nullable: true, select: false })
  searchVector: string | null;

  @OneToMany(
    () => DeliveryOrderModel,
    (deliveryOrderModel) => deliveryOrderModel.deliveryRoute,
  )
  deliveryOrders: DeliveryOrderModel[];
}
