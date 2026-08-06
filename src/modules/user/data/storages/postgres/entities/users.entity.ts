import { Column, Entity, Index, OneToMany } from 'typeorm';
import { SavedLocations } from './saved-locations.entity';

@Index('user_pkey', ['id'], { unique: true })
@Entity('users', { schema: 'public' })
export class Users {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('varchar', { name: 'name' })
  name: string;

  @Column('varchar', { name: 'uuid', nullable: true })
  uuid: string;

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

  @OneToMany(() => SavedLocations, (savedLocations) => savedLocations.user)
  savedLocations: SavedLocations[];
}
