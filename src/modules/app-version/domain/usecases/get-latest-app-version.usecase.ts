import { Injectable } from '@nestjs/common';
import { AppVersionModel } from '@/@types/modules/app-version/domain/models/app-version.model';
import { AppVersionsRepository } from '../repositories/app-versions.repository';

@Injectable()
export class GetLatestAppVersionUsecase {
  constructor(private readonly appVersionsRepo: AppVersionsRepository) {}

  async execute(platform: string): Promise<AppVersionModel> {
    const versions = await this.appVersionsRepo.findByQuery({
      platform,
      isActive: true,
    });
    return versions?.[0] ?? null;
  }
}
