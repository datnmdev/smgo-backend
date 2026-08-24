import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserModel } from './user.model';

@Index('location_pkey', ['id'], { unique: true })
@Index('idx_location__search_vector', ['searchVector'], {})
@Entity('location', { schema: 'public' })
export class LocationModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'location_name' })
  locationName: string;

  @Column('text', { name: 'contact_name' })
  contactName: string;

  @Column('text', { name: 'address' })
  address: string;

  @Column('point', { name: 'location' })
  location: Point;

  @Column('uuid', { name: 'user_id' })
  userId: string;

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

  @Column('uuid', { name: 'media_ids', array: true, default: () => "'{}'[]" })
  mediaIds: string[];

  @Column('text', { name: 'note', nullable: true })
  note: string | null;

  @Column('tsvector', { name: 'search_vector', nullable: true, select: false })
  searchVector: string | null;

  @ManyToOne(() => UserModel, (user) => user.locations)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UserModel;
}

interface Point {
  x: number;
  y: number;
}