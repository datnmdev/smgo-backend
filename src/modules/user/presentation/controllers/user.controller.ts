import { AppResponse } from '@/@types/core/class/response';
import { UserModel } from '@/@types/modules/user/domain/models/user';
import { JwtAuthGuard } from '@/modules/auth/security/jwt-auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppResponse as CAppResponse } from '@/core/class/response.class';
import { GetUsersByQueryUsecase } from '../../domain/usecases/get-users-by-query.usecase';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtPayload } from '@/@types/jwt';
import { GetSavedLocaitonsQueryDto } from '../dtos/get-saved-locations-req.dto';
import { GetSavedLocationsUsecase } from '../../domain/usecases/get-saved-locations.usecase';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUsersByQueryUsecase: GetUsersByQueryUsecase,
    private readonly getSavedLocationsUsecase: GetSavedLocationsUsecase,
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
    @Query() getSavedLocaitonsQuery: GetSavedLocaitonsQueryDto,
  ): Promise<AppResponse<UserModel>> {
    return CAppResponse.ok(
      await this.getSavedLocationsUsecase.execute({
        keyword: getSavedLocaitonsQuery.keyword,
        userId: authPayload.userId,
      }),
    );
  }
}
