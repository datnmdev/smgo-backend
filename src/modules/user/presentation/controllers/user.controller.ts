import { JwtAuthGuard } from '@/core/security/jwt-auth.guard';
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
import { AppResponse } from '@/core/common/response.dto';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import {
  UpdateLocationBodyReqDto,
  UpdateLocationParamsReqDto,
} from '../dtos/update-location.dto';
import { GetUsersUsecase } from '../../domain/usecases/get-users.usecase';
import {
  GetLocationsUsecase,
  TLocationWithMedia,
} from '../../domain/usecases/get-locations.usecase';
import { CreateLocationUsecase } from '../../domain/usecases/create-location.usecase';
import { UpdateLocationUsecase } from '../../domain/usecases/update-location.usecase';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { TUser } from '../../domain/entities/user.entity';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { GetLocationsQueryReqDto } from '../dtos/get-locations.dto';
import { CreateLocationBodyReqDto } from '../dtos/create-location.dto';
import { TLocation } from '../../domain/entities/location.entity';
import { CreateLocationData } from '../../domain/repositories/location.repository';
import { DeleteLocationsBodyReqDto } from '../dtos/delete-locations.dto';
import { DeleteLocationsUsecase } from '../../domain/usecases/delete-locations.usecase';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUsersUsecase: GetUsersUsecase,
    private readonly getLocationsUsecase: GetLocationsUsecase,
    private readonly createLocationUsecase: CreateLocationUsecase,
    private readonly updateLocationUsecase: UpdateLocationUsecase,
    private readonly deleteLocationsUsecase: DeleteLocationsUsecase,
  ) {}

  @Get('profile')
  async getProfile(
    @AuthPayload() authPayload: JwtPayload,
  ): Promise<AppResponse<TUser>> {
    return AppResponse.ok(
      (
        await this.getUsersUsecase.execute({
          id: authPayload.userId,
        })
      )[0],
    );
  }

  @Get('locations')
  async getLocations(
    @AuthPayload() authPayload: JwtPayload,
    @Query() getLocationsQuery: GetLocationsQueryReqDto,
  ): Promise<AppResponse<TPaginationResponse<TLocationWithMedia>>> {
    return AppResponse.ok(
      await this.getLocationsUsecase.execute({
        keyword: getLocationsQuery.keyword,
        id: getLocationsQuery.id,
        userId: authPayload.userId,
        pageNumber: getLocationsQuery.pageNumber,
        pageSize: getLocationsQuery.pageSize,
      }),
    );
  }

  @Post('locations')
  async createLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Body() createLocationBody: CreateLocationBodyReqDto,
  ): Promise<AppResponse<TLocation>> {
    const data: CreateLocationData = {
      ...createLocationBody,
      userId: authPayload.userId,
    };
    return AppResponse.ok(await this.createLocationUsecase.execute(data));
  }

  @Put('locations/:id')
  async updateLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateLocationParamsReqDto: UpdateLocationParamsReqDto,
    @Body() updateLocationBodyReqDto: UpdateLocationBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.updateLocationUsecase.execute(
        authPayload.userId,
        updateLocationParamsReqDto.id,
        updateLocationBodyReqDto,
      ),
    );
  }

  @Delete('locations/m')
  async deleteLocations(
    @AuthPayload() authPayload: JwtPayload,
    @Body() deleteLocationsBody: DeleteLocationsBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.deleteLocationsUsecase.execute(
        authPayload.userId,
        deleteLocationsBody.locationIds,
      ),
    );
  }
}
