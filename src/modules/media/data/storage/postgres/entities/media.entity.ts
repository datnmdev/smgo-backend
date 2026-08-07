import { Column, Entity, Index } from 'typeorm';

@Index('media_pkey', ['id'], { unique: true })
@Entity('media', { schema: 'public' })
export class Media {
  @Column('uuid', { primary: true, name: 'id' })
  id: string;

  @Column('text', { name: 'mimetype' })
  mimetype: string;

  @Column('text', { name: 'file_key' })
  fileKey: string;
}
