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
import {
  GetRouteStopsQueryReqDto,
  GetRouteStopsResDto,
} from '../dtos/get-route-stops.dto';
import { RouteStopModel } from '@/@types/modules/route/domain/models/route-stop.model';
import {
  CreateRouteStopBodyReqDto,
  CreateRouteStopParamsReqDto,
} from '../dtos/create-route-stop.dto';
import {
  UpdateRouteStopBodyReqDto,
  UpdateRouteStopParamsReqDto,
} from '../dtos/update-route-stop.dto';
import { DeleteRouteStopParamsReqDto } from '../dtos/delete-route-stop.dto';
import { GetRouteStopsUsecase } from '../../domain/usecases/get-route-stops.usecase';
import { CreateRouteStopUsecase } from '../../domain/usecases/create-route-stop.usecase';
import { UpdateRouteStopUsecase } from '../../domain/usecases/update-route-stop.usecase';
import { DeleteRouteStopUsecase } from '../../domain/usecases/delete-route-stop.usecase';
import { CreateRouteData } from '@/@types/modules/route/domain/repositories/routes.repository';
import {
  CreateRouteStopData,
  UpdateRouteStopData,
} from '@/@types/modules/route/domain/repositories/route-stops.repository';

@Controller('route')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(
    private readonly getRoutesUsecase: GetRoutesUsecase,
    private readonly createRouteUsecase: CreateRouteUsecase,
    private readonly updateRouteUsecase: UpdateRouteUsecase,
    private readonly deleteRouteUsecase: DeleteRouteUsecase,
    private readonly getRouteStopsUsecase: GetRouteStopsUsecase,
    private readonly createRouteStopUsecase: CreateRouteStopUsecase,
    private readonly updateRouteStopUsecase: UpdateRouteStopUsecase,
    private readonly deleteRouteStopUsecase: DeleteRouteStopUsecase,
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
    const data: CreateRouteData = {
      ...createRouteBody,
      userId: authPayload.userId,
    };
    return CAppResponse.ok(await this.createRouteUsecase.execute(data));
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

  @Get('route-stop')
  async getRouteStops(
    @AuthPayload() authPayload: JwtPayload,
    @Query() getRouteStopsQuery: GetRouteStopsQueryReqDto,
  ): Promise<AppResponse<RouteStopModel>> {
    return CAppResponse.ok(
      plainToInstance(
        GetRouteStopsResDto,
        await this.getRouteStopsUsecase.execute({
          keyword: getRouteStopsQuery.keyword,
          userId: authPayload.userId,
        }),
      ),
    );
  }

  @Post(':routeId/route-stop')
  async createRouteStop(
    @AuthPayload() authPayload: JwtPayload,
    @Param() createRouteStopParams: CreateRouteStopParamsReqDto,
    @Body() createRouteStopBody: CreateRouteStopBodyReqDto,
  ): Promise<AppResponse> {
    const data: CreateRouteStopData = {
      ...createRouteStopBody,
      routeId: createRouteStopParams.routeId,
    };
    return CAppResponse.ok(
      await this.createRouteStopUsecase.execute(authPayload.userId, data),
    );
  }

  @Put(':routeId/route-stop/:id')
  async updateRouteStop(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateRouteStopParams: UpdateRouteStopParamsReqDto,

    @Body() updateRouteStopBody: UpdateRouteStopBodyReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.updateRouteStopUsecase.execute(
        authPayload.userId,
        updateRouteStopParams.id,
        updateRouteStopBody,
      ),
    );
  }

  @Delete(':routeId/route-stop/:id')
  async deleteRouteStop(
    @AuthPayload() authPayload: JwtPayload,
    @Param() deleteRouteStopParams: DeleteRouteStopParamsReqDto,
  ): Promise<AppResponse<void>> {
    return CAppResponse.ok(
      await this.deleteRouteStopUsecase.execute(
        authPayload.userId,
        deleteRouteStopParams.id,
      ),
    );
  }
}
