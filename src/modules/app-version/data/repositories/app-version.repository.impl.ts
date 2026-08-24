import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AppVersionModel } from '../models/app-version.model';
import {
  AppVersionRepository,
  FindAppVersionsByQuery,
} from '../../domain/repositories/app-version.repository';
import { AppVersion } from '../../domain/entities/app-version.entity';

@Injectable()
export class AppVersionRepositoryImpl implements AppVersionRepository {
  constructor(
    @InjectRepository(AppVersionModel)
    private readonly appVersionRepo: Repository<AppVersionModel>,
  ) {}

  findByQuery(query: FindAppVersionsByQuery): Promise<AppVersion[]> {
    return this.appVersionRepo
      .createQueryBuilder('appVersion')
      .where(
        new Brackets((qb) => {
          if (typeof query?.id === 'string') {
            qb.andWhere('appVersion.id = :id', {
              id: query.id,
            });
          }
          if (typeof query?.platform === 'string') {
            qb.andWhere('appVersion.platform = :platform', {
              platform: query.platform,
            });
          }
          if (typeof query?.versionName === 'string') {
            qb.andWhere('appVersion.versionName = :versionName', {
              versionName: query.versionName,
            });
          }
          if (typeof query?.buildNumber === 'number') {
            qb.andWhere('appVersion.buildNumber = :buildNumber', {
              buildNumber: query.buildNumber,
            });
          }
          if (typeof query?.minSupportedBuild === 'number') {
            qb.andWhere('appVersion.minSupportedBuild = :minSupportedBuild', {
              minSupportedBuild: query.minSupportedBuild,
            });
          }
          if (typeof query?.isActive === 'boolean') {
            qb.andWhere('appVersion.isActive = :isActive', {
              isActive: query.isActive,
            });
          }
          if (typeof query?.storeAppId === 'string') {
            qb.andWhere('appVersion.storeAppId = :storeAppId', {
              storeAppId: query.storeAppId,
            });
          }
          if (typeof query?.isMaintenance === 'boolean') {
            qb.andWhere('appVersion.isMaintenance = :isMaintenance', {
              isMaintenance: query.isMaintenance,
            });
          }
        }),
      )
      .getMany();
  }
}
