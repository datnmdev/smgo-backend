import { AppResponse } from '@/@types/core/class/response';
import { UserModel } from '@/@types/modules/user/domain/models/user';
import { JwtAuthGuard } from '@/modules/auth/security/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppResponse as CAppResponse } from '@/core/class/response.class';
import { GetUsersByQueryUsecase } from '../../domain/usecases/get-users-by-query.usecase';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtPayload } from '@/@types/jwt';
import {
  GetSavedLocationsResDto,
  GetSavedLocationsQueryReqDto,
} from '../dtos/get-saved-locations.dto';
import { GetSavedLocationsUsecase } from '../../domain/usecases/get-saved-locations.usecase';
import { plainToInstance } from 'class-transformer';
import { SaveLocationBodyReqDto } from '../dtos/save-location.dto';
import { SaveLocationUsecase } from '../../domain/usecases/save-location.usecase';
import {
  UpdateSavedLocationBodyReqDto,
  UpdateSavedLocationParamsReqDto,
} from '../dtos/update-saved-location.dto';
import { UpdateSavedLocationUsecase } from '../../domain/usecases/update-saved-location.usecase';
import { DeleteSavedLocationParamsReqDto } from '../dtos/delete-saved-location.dto';
import { DeleteSavedLocationUsecase } from '../../domain/usecases/delete-saved-location.usecase';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUsersByQueryUsecase: GetUsersByQueryUsecase,
    private readonly getSavedLocationsUsecase: GetSavedLocationsUsecase,
    private readonly saveLocationUsecase: SaveLocationUsecase,
    private readonly updateSavedLocationUsecase: UpdateSavedLocationUsecase,
    private readonly deleteSavedLocationUsecase: DeleteSavedLocationUsecase,
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

  @Put('saved-locations/:id')
  async updateSavedLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateSavedLocationParams: UpdateSavedLocationParamsReqDto,

    @Body() updateSavedLocationBody: UpdateSavedLocationBodyReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.updateSavedLocationUsecase.execute(
        authPayload.userId,
        updateSavedLocationParams.id,
        updateSavedLocationBody,
      ),
    );
  }

  @Delete('saved-locations/:id')
  async deleteSavedLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateSavedLocationParams: DeleteSavedLocationParamsReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.deleteSavedLocationUsecase.execute(
        authPayload.userId,
        updateSavedLocationParams.id,
      ),
    );
  }
}
