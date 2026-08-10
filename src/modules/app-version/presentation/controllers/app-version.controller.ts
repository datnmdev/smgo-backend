import { AppResponse } from "@/@types/core/class/response";
import { Controller, Get, Query } from "@nestjs/common";
import { AppResponse as CAppResponse } from "@/core/class/response.class";
import { GetLatestAppVersionQueryReqDto } from "../dtos/get-latest-app-version-req.dto";
import { AppVersionModel } from "@/@types/modules/app-version/domain/models/app-version.model";
import { GetLatestAppVersionUsecase } from "../../domain/usecases/get-latest-app-version.usecase";

@Controller('app-version')
export class AppVersionController {
  constructor(
    private readonly getLatestAppVersionUsecase: GetLatestAppVersionUsecase
  ) {}

  @Get('latest')
  async getLatestAppVersion(
    @Query() query: GetLatestAppVersionQueryReqDto
  ): Promise<AppResponse<AppVersionModel>> {
    return CAppResponse.ok(
      await this.getLatestAppVersionUsecase.execute(query.platform)
    )
  }
}