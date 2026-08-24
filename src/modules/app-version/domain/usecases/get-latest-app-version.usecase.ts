import { Injectable } from '@nestjs/common';
import { AppVersionRepository } from '../repositories/app-version.repository';
import { AppVersion } from '../entities/app-version.entity';

@Injectable()
export class GetLatestAppVersionUsecase {
  constructor(private readonly appVersionsRepo: AppVersionRepository) {}

  async execute(
    platform: string,
    localeTag: string,
  ): Promise<AppVersion | null> {
    const version = (
      await this.appVersionsRepo.findByQuery({
        platform,
        isActive: true,
      })
    )?.[0];
    if (version) {
      const locale = new Intl.Locale(localeTag);
      version.maintenanceMessage =
        version.maintenanceMessage?.[locale.language] ?? null;
      return version;
    }
    return null;
  }
}
