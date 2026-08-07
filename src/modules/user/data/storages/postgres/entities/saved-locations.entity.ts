import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './users.entity';

@Index('saved_locations_pkey', ['id'], { unique: true })
@Index('idx_saved_locations__search_vector', ['searchVector'], {})
@Entity('saved_locations', { schema: 'public' })
export class SavedLocations {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'name' })
  name: string;

  @Column('text', { name: 'contact_name' })
  contactName: string;

  @Column('text', { name: 'address' })
  address: string;

  @Column('point', { name: 'location', nullable: true })
  location: string | object | null;

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

  @Column('character varying', { name: 'contact_phone', length: 50 })
  contactPhone: string;

  @Column('tsvector', { name: 'search_vector', nullable: true, select: false })
  searchVector: string | null;

  @ManyToOne(() => Users, (users) => users.savedLocations)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;
}
