import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DeliveryRouteModel } from './delivery-route.model';

@Index('delivery_order_pkey', ['id'], { unique: true })
@Index(
  'UQ_delivery_order__delivery_route_id__sequence_order',
  ['deliveryRouteId', 'sequenceOrder'],
  { unique: true },
)
@Index(
  'UQ_delivery_order__delivery_route_id__order_code',
  ['deliveryRouteId', 'orderCode'],
  { unique: true },
)
@Index('idx_delivery_order__search_vector', ['searchVector'], {})
@Entity('delivery_order', { schema: 'public' })
export class DeliveryOrderModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'order_code' })
  orderCode: string;

  @Column('uuid', { name: 'order_media_id', nullable: true })
  orderMediaId: string | null;

  @Column('text', { name: 'order_name', nullable: true })
  orderName: string | null;

  @Column('integer', { name: 'sequence_order', unique: true, nullable: true })
  sequenceOrder: number | null;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'checked', 'sorted', 'delivered', 'cancelled'],
    default: () => "'pending'",
  })
  status:
    | 'pending'
    | 'checked'
    | 'sorted'
    | 'delivered'
    | 'cancelled'
    | 'rescheduled';

  @Column('text', { name: 'contact_name' })
  contactName: string;

  @Column('text', { name: 'contact_phone' })
  contactPhone: string;

  @Column('text', { name: 'address' })
  address: string;

  @Column('point', { name: 'location' })
  location: Point;

  @Column('uuid', { name: 'delivery_route_id', unique: true })
  deliveryRouteId: string;

  @Column('uuid', { name: 'applied_location_id', nullable: true })
  appliedLocationId: string | null;

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

  @Column('timestamp with time zone', { name: 'checked_at', nullable: true })
  checkedAt: Date | null;

  @Column('timestamp with time zone', { name: 'sorted_at', nullable: true })
  sortedAt: Date | null;

  @Column('timestamp with time zone', { name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @Column('timestamp with time zone', { name: 'cancelled_at', nullable: true })
  cancelledAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'rescheduled_at',
    nullable: true,
  })
  rescheduledAt: Date | null;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('tsvector', { name: 'search_vector', nullable: true, select: false })
  searchVector: string | null;

  @ManyToOne(
    () => DeliveryRouteModel,
    (deliveryRouteModel) => deliveryRouteModel.deliveryOrders,
  )
  @JoinColumn([{ name: 'delivery_route_id', referencedColumnName: 'id' }])
  deliveryRoute: DeliveryRouteModel;
}

interface Point {
  x: number;
  y: number;
}
