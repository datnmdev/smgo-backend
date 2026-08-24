import { Column, Entity, Index, OneToMany } from 'typeorm';
import { LocationModel } from './location.model';

@Index('user_pkey', ['id'], { unique: true })
@Entity('user', { schema: 'public' })
export class UserModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('enum', {
    name: 'provider',
    nullable: true,
    enum: ['google', 'facebook'],
  })
  provider: 'google' | 'facebook' | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', { name: 'uuid', nullable: true, length: 50 })
  uuid: string | null;

  @OneToMany(() => LocationModel, (savedLocations) => savedLocations.user)
  locations: LocationModel[];
}
