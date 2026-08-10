import { Column, Entity, Index } from 'typeorm';

@Index('uk_platform__build_number', ['buildNumber', 'platform'], {
  unique: true,
})
@Index('app_versions_pkey', ['id'], { unique: true })
@Entity('app_versions', { schema: 'public' })
export class AppVersions {
  @Column('uuid', { primary: true, name: 'id' })
  id: string;

  @Column('character varying', { name: 'platform', unique: true, length: 20 })
  platform: string;

  @Column('character varying', { name: 'version_name', length: 50 })
  versionName: string;

  @Column('integer', { name: 'build_number', unique: true })
  buildNumber: number;

  @Column('integer', { name: 'min_supported_build' })
  minSupportedBuild: number;

  @Column('boolean', { name: 'is_active' })
  isActive: boolean;

  @Column('character varying', { name: 'store_app_id', length: 100 })
  storeAppId: string;

  @Column('jsonb', { name: 'release_notes', default: {} })
  releaseNotes: object;

  @Column('boolean', { name: 'is_maintenance', default: () => 'false' })
  isMaintenance: boolean;

  @Column('jsonb', { name: 'maintenance_message', default: {} })
  maintenanceMessage: object;

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
}
