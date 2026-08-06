import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RouteStops } from './route-stops.entity';

@Index('routes_pkey', ['id'], { unique: true })
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

  @OneToMany(() => RouteStops, (routeStops) => routeStops.route)
  routeStops: RouteStops[];
}
