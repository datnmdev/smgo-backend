import { Column, Entity, Index } from 'typeorm';

@Index('media_pkey', ['id'], { unique: true })
@Entity('media', { schema: 'public' })
export class MediaModel {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'file_key' })
  fileKey: string;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'attached'],
  })
  status: 'pending' | 'attached';

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
