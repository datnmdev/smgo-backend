import { AppVersionModel } from '@/@types/modules/app-version/domain/models/app-version.model';
import { FindAppVersionsByQuery } from '@/@types/modules/app-version/domain/repositories/app-version.repository';
import { AppVersionsRepository } from '@/modules/app-version/domain/repositories/app-versions.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AppVersions } from '../entities/app-versions.entity';

@Injectable()
export class PostgresAppVersionsRepository implements AppVersionsRepository {
  constructor(
    @InjectRepository(AppVersions)
    private readonly appVersionRepo: Repository<AppVersions>,
  ) {}

  findByQuery(query: FindAppVersionsByQuery): Promise<AppVersionModel[]> {
    return this.appVersionRepo
      .createQueryBuilder('appVersions')
      .where(
        new Brackets((qb) => {
          if (typeof query?.id === 'string') {
            qb.andWhere('appVersions.id = :id', {
              id: query.id,
            });
          }
          if (typeof query?.platform === 'string') {
            qb.andWhere('appVersions.platform = :platform', {
              platform: query.platform,
            });
          }
          if (typeof query?.versionName === 'string') {
            qb.andWhere('appVersions.versionName = :versionName', {
              versionName: query.versionName,
            });
          }
          if (typeof query?.buildNumber === 'number') {
            qb.andWhere('appVersions.buildNumber = :buildNumber', {
              buildNumber: query.buildNumber,
            });
          }
          if (typeof query?.minSupportedBuild === 'number') {
            qb.andWhere('appVersions.minSupportedBuild = :minSupportedBuild', {
              minSupportedBuild: query.minSupportedBuild,
            });
          }
          if (typeof query?.isActive === 'boolean') {
            qb.andWhere('appVersions.isActive = :isActive', {
              isActive: query.isActive,
            });
          }
          if (typeof query?.storeAppId === 'string') {
            qb.andWhere('appVersions.storeAppId = :storeAppId', {
              storeAppId: query.storeAppId,
            });
          }
          if (typeof query?.isMaintenance === 'boolean') {
            qb.andWhere('appVersions.isMaintenance = :isMaintenance', {
              isMaintenance: query.isMaintenance,
            });
          }
        }),
      )
      .getMany();
  }
}
