import { Controller, Get, Query } from '@nestjs/common';
import { AppResponse, AppResponse as CAppResponse } from '@/core/common/response.dto';
import { GetLatestAppVersionQueryReqDto } from '../dtos/get-latest-app-version-req.dto';
import { GetLatestAppVersionUsecase } from '../../domain/usecases/get-latest-app-version.usecase';
import { AppVersion } from '../../domain/entities/app-version.entity';

@Controller('app-version')
export class AppVersionController {
  constructor(
    private readonly getLatestAppVersionUsecase: GetLatestAppVersionUsecase,
  ) {}

  @Get('latest')
  async getLatestAppVersion(
    @Query() query: GetLatestAppVersionQueryReqDto,
  ): Promise<AppResponse<AppVersion>> {
    return CAppResponse.ok(
      await this.getLatestAppVersionUsecase.execute(
        query.platform,
        query.locale,
      ),
    );
  }
}
