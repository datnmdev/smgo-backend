import { AppResponse } from '@/@types/core/class/response';
import { JwtPayload } from '@/@types/jwt';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
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
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '@/modules/auth/security/jwt-auth.guard';
import { GetRoutesQueryReqDto, GetRoutesResDto } from '../dtos/get-routes.dto';
import { CreateRouteBodyReqDto } from '../dtos/create-route.dto';
import {
  UpdateRouteBodyReqDto,
  UpdateRouteParamsReqDto,
} from '../dtos/update-route.dto';
import { DeleteRouteParamsReqDto } from '../dtos/delete-route.dto';
import { RouteModel } from '@/@types/modules/route/domain/models/route.model';
import { GetRoutesUsecase } from '../../domain/usecases/get-routes.usecase';
import { CreateRouteUsecase } from '../../domain/usecases/create-route.usecase';
import { UpdateRouteUsecase } from '../../domain/usecases/update-route.usecase';
import { DeleteRouteUsecase } from '../../domain/usecases/delete-route.usecase';

@Controller('route')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(
    private readonly getRoutesUsecase: GetRoutesUsecase,
    private readonly createRouteUsecase: CreateRouteUsecase,
    private readonly updateRouteUsecase: UpdateRouteUsecase,
    private readonly deleteRouteUsecase: DeleteRouteUsecase,
  ) {}

  @Get()
  async getRoutes(
    @AuthPayload() authPayload: JwtPayload,
    @Query() getRoutesQuery: GetRoutesQueryReqDto,
  ): Promise<AppResponse<RouteModel>> {
    return CAppResponse.ok(
      plainToInstance(
        GetRoutesResDto,
        await this.getRoutesUsecase.execute({
          keyword: getRoutesQuery.keyword,
          userId: authPayload.userId,
        }),
      ),
    );
  }

  @Post()
  async createRoute(
    @AuthPayload() authPayload: JwtPayload,
    @Body() createRouteBody: CreateRouteBodyReqDto,
  ): Promise<AppResponse> {
    return CAppResponse.ok(
      await this.createRouteUsecase.execute(
        authPayload.userId,
        createRouteBody,
      ),
    );
  }

  @Put(':id')
  async updateSavedLocation(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateRouteParams: UpdateRouteParamsReqDto,

    @Body() updateRouteBody: UpdateRouteBodyReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.updateRouteUsecase.execute(
        authPayload.userId,
        updateRouteParams.id,
        updateRouteBody,
      ),
    );
  }

  @Delete(':id')
  async deleteRoute(
    @AuthPayload() authPayload: JwtPayload,
    @Param() deleteRouteParams: DeleteRouteParamsReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.deleteRouteUsecase.execute(
        authPayload.userId,
        deleteRouteParams.id,
      ),
    );
  }
}
