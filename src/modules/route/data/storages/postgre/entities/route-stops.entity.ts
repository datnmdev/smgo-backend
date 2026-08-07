import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Routes } from './routes.entity';
import { Point } from '@/@types/modules/user/domain/models/saved-location';

@Index('route_stops_pkey', ['id'], { unique: true })
@Index(
  'UQ_route_stops__route_id__sequence_order',
  ['routeId', 'sequenceOrder'],
  { unique: true },
)
@Index('idx_route_stops__search_vector', ['searchVector'], {})
@Entity('route_stops', { schema: 'public' })
export class RouteStops {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'order_code' })
  orderCode: string;

  @Column('text', { name: 'order_name', nullable: true })
  orderName: string | null;

  @Column('integer', { name: 'sequence_order', unique: true, nullable: true })
  sequenceOrder: number | null;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'delivered', 'cancelled'],
    default: () => "'pending'",
  })
  status: 'pending' | 'delivered' | 'cancelled';

  @Column('text', { name: 'contact_name', nullable: true })
  contactName: string | null;

  @Column('text', { name: 'contact_phone' })
  contactPhone: string;

  @Column('text', { name: 'address' })
  address: string;

  @Column('point', { name: 'location', nullable: true })
  location: Point | null;

  @Column('uuid', { name: 'route_id', unique: true })
  routeId: string;

  @Column('uuid', { name: 'applied_location', nullable: true })
  appliedLocation: string | null;

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

  @Column('timestamp with time zone', { name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @Column('timestamp with time zone', { name: 'cancelled_at', nullable: true })
  cancelledAt: Date | null;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('tsvector', { name: 'search_vector', nullable: true, select: false })
  searchVector: string | null;

  @ManyToOne(() => Routes, (routes) => routes.routeStops)
  @JoinColumn([{ name: 'route_id', referencedColumnName: 'id' }])
  route: Routes;
}
