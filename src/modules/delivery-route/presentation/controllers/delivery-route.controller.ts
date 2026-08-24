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
import { JwtAuthGuard } from '@/core/security/jwt-auth.guard';
import { AppResponse } from '@/core/common/response.dto';
import { GetDeliveryRoutesUsecase } from '../../domain/usecases/get-delivery-routes.usecase';
import { CreateDeliveryRouteUsecase } from '../../domain/usecases/create-delivery-route.usecase';
import { UpdateDeliveryRouteUsecase } from '../../domain/usecases/update-delivery-route.usecase';
import { DeleteDeliveryRouteUsecase } from '../../domain/usecases/delete-delivery-route.usecase';
import { CreateDeliveryOrderUsecase } from '../../domain/usecases/create-delivery-order.usecase';
import { UpdateDeliveryOrderUsecase } from '../../domain/usecases/update-delivery-order.usecase';
import { DeleteDeliveryOrderUsecase } from '../../domain/usecases/delete-delivery-order.usecase';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { GetDeliveryRoutesQueryReqDto } from '../dtos/get-delivery-routes.dto';
import { CreateDeliveryRouteBodyReqDto } from '../dtos/create-delivery-route.dto';
import {
  UpdateDeliveryRouteBodyReqDto,
  UpdateDeliveryRouteParamsReqDto,
} from '../dtos/update-delivery-route.dto';
import { DeleteDeliveryRouteParamsReqDto } from '../dtos/delete-delivery-route.dto';
import {
  CreateDeliveryOrderBodyReqDto,
  CreateDeliveryOrderParamsReqDto,
} from '../dtos/create-delivery-order.dto';
import {
  UpdateDeliveryOrderBodyReqDto,
  UpdateDeliveryOrderParamsReqDto,
} from '../dtos/update-delivery-order.dto';
import { DeleteDeliveryOrderParamsReqDto } from '../dtos/delete-delivery-order.dto';

@Controller('delivery-route')
@UseGuards(JwtAuthGuard)
export class DeliveryRouteController {
  constructor(
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly createDeliveryRouteUsecase: CreateDeliveryRouteUsecase,
    private readonly updateDeliveryRouteUsecase: UpdateDeliveryRouteUsecase,
    private readonly deleteDeliveryRouteUsecase: DeleteDeliveryRouteUsecase,
    private readonly createDeliveryOrderUsecase: CreateDeliveryOrderUsecase,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
    private readonly deleteDeliveryOrderUsecase: DeleteDeliveryOrderUsecase,
  ) {}

  @Get()
  async getDeliveryRoutes(
    @AuthPayload() authPayload: JwtPayload,
    @Query() queryDto: GetDeliveryRoutesQueryReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.getDeliveryRoutesUsecase.execute({
        keyword: queryDto.keyword,
        userId: authPayload.userId,
        id: queryDto.id,
        pageNumber: queryDto.pageNumber,
        pageSize: queryDto.pageSize,
        status: queryDto.status,
      }),
    );
  }

  @Post()
  async createDeliveryRoute(
    @AuthPayload() authPayload: JwtPayload,
    @Body() createDeliveryRouteBody: CreateDeliveryRouteBodyReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.createDeliveryRouteUsecase.execute({
        ...createDeliveryRouteBody,
        userId: authPayload.userId,
      }),
    );
  }

  @Put(':id')
  async updateDeliveryRoute(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateDeliveryRouteParams: UpdateDeliveryRouteParamsReqDto,
    @Body() updateDeliveryRouteBody: UpdateDeliveryRouteBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.updateDeliveryRouteUsecase.execute(
        authPayload.userId,
        updateDeliveryRouteParams.id,
        updateDeliveryRouteBody,
      ),
    );
  }

  @Delete(':id')
  async deleteDeliveryRoute(
    @AuthPayload() authPayload: JwtPayload,
    @Param() deleteDeliveryRouteParams: DeleteDeliveryRouteParamsReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.deleteDeliveryRouteUsecase.execute(
        authPayload.userId,
        deleteDeliveryRouteParams.id,
      ),
    );
  }

  @Post(':deliveryRouteId/delivery-order')
  async createDeliveryOrder(
    @AuthPayload() authPayload: JwtPayload,
    @Param() createDeliveryOrderParams: CreateDeliveryOrderParamsReqDto,
    @Body() createDeliveryOrderBody: CreateDeliveryOrderBodyReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.createDeliveryOrderUsecase.execute(authPayload.userId, {
        ...createDeliveryOrderBody,
        deliveryRouteId: createDeliveryOrderParams.deliveryRouteId,
      }),
    );
  }

  @Put(':deliveryRouteId/delivery-order/:deliveryOrderId')
  async updateDeliveryOrder(
    @AuthPayload() authPayload: JwtPayload,
    @Param() updateDeliveryOrderParams: UpdateDeliveryOrderParamsReqDto,
    @Body() updateDeliveryOrderBody: UpdateDeliveryOrderBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.updateDeliveryOrderUsecase.execute(
        authPayload.userId,
        updateDeliveryOrderParams.deliveryRouteId,
        updateDeliveryOrderParams.deliveryOrderId,
        updateDeliveryOrderBody,
      ),
    );
  }

  @Delete(':deliveryRouteId/delivery-order/:deliveryOrderId')
  async deleteDeliveryOrder(
    @AuthPayload() authPayload: JwtPayload,
    @Param() deleteDeliveryOrderParams: DeleteDeliveryOrderParamsReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.deleteDeliveryOrderUsecase.execute(
        authPayload.userId,
        deleteDeliveryOrderParams.deliveryRouteId,
        deleteDeliveryOrderParams.deliveryOrderId,
      ),
    );
  }
}
