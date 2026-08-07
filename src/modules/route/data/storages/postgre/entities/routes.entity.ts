import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RouteStops } from './route-stops.entity';

@Index('routes_pkey', ['id'], { unique: true })
@Index('idx_routes__search_vector', ['searchVector'], {})
@Entity('routes', { schema: 'public' })
export class Routes {
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
    enum: ['pending', 'scheduled', 'in_progress', 'completed'],
    default: () => "'pending'",
  })
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';

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

  @OneToMany(() => RouteStops, (routeStops) => routeStops.route)
  routeStops: RouteStops[];
}
