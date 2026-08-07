import { AppResponse } from '@/@types/core/class/response';
import { UserModel } from '@/@types/modules/user/domain/models/user';
import { JwtAuthGuard } from '@/modules/auth/security/jwt-auth.guard';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AppResponse as CAppResponse } from '@/core/class/response.class';
import { GetUsersByQueryUsecase } from '../../domain/usecases/get-users-by-query.usecase';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtPayload } from '@/@types/jwt';
import {
  GetSavedLocationsResDto,
  GetSavedLocationsQueryReqDto,
} from '../dtos/get-saved-locations.dto';
import { GetSavedLocationsUsecase } from '../../domain/usecases/get-saved-locations.usecase';
import _ from 'lodash';
import { plainToInstance } from 'class-transformer';
import { SaveLocationBodyReqDto } from '../dtos/save-location.dto';
import { SaveLocationUsecase } from '../../domain/usecases/save-location.usecase';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUsersByQueryUsecase: GetUsersByQueryUsecase,
    private readonly getSavedLocationsUsecase: GetSavedLocationsUsecase,
    private readonly saveLocationUsecase: SaveLocationUsecase
  ) {}

  @Get('profile')
  async getProfile(
    @AuthPayload() authPayload: JwtPayload,
  ): Promise<AppResponse<UserModel>> {
    return CAppResponse.ok(
      (
        await this.getUsersByQueryUsecase.execute({
          id: authPayload.userId,
        })
      )[0],
    );
  }

  @Get('saved-locations')
  async getSavedLocations(
    @AuthPayload() authPayload: JwtPayload,
    @Query() getSavedLocationsQuery: GetSavedLocationsQueryReqDto,
  ): Promise<AppResponse<UserModel>> {
    return CAppResponse.ok(
      plainToInstance(
        GetSavedLocationsResDto,
        await this.getSavedLocationsUsecase.execute({
          keyword: getSavedLocationsQuery.keyword,
          userId: authPayload.userId,
        }),
      ),
    );
  }

  @Post('saved-locations')
  async saveLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Body() saveLocationBody: SaveLocationBodyReqDto,
  ): Promise<AppResponse> {
    return CAppResponse.ok(
      await this.saveLocationUsecase.execute(
        authPayload.userId,
        saveLocationBody,
      ),
    );
  }
}
