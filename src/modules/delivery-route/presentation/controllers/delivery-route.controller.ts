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
import { CreateDeliveryOrderUsecase } from '../../domain/usecases/create-delivery-order.usecase';
import { UpdateDeliveryOrderUsecase } from '../../domain/usecases/update-delivery-order.usecase';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { GetDeliveryRoutesQueryReqDto } from '../dtos/get-delivery-routes.dto';
import { CreateDeliveryRouteBodyReqDto } from '../dtos/create-delivery-route.dto';
import {
  UpdateDeliveryRouteBodyReqDto,
  UpdateDeliveryRouteParamsReqDto,
} from '../dtos/update-delivery-route.dto';
import { DeleteDeliveryRoutesBodyReqDto } from '../dtos/delete-delivery-routes.dto';
import {
  CreateDeliveryOrderBodyReqDto,
  CreateDeliveryOrderParamsReqDto,
} from '../dtos/create-delivery-order.dto';
import {
  UpdateDeliveryOrderBodyReqDto,
  UpdateDeliveryOrderParamsReqDto,
} from '../dtos/update-delivery-order.dto';
import {
  DeleteDeliveryOrdersBodyReqDto,
  DeleteDeliveryOrdersParamsReqDto,
} from '../dtos/delete-delivery-orders.dto';
import { RecheckDeliveryOrdersUsecase } from '../../domain/usecases/recheck-delivery-orders.usecase';
import {
  RecheckDeliveryOrdersBodyReqDto,
  RecheckDeliveryOrdersParamsReqDto,
} from '../dtos/recheck-delivery-orders.dto';
import {
  ConfirmDeliveryOrdersBodyReqDto,
  ConfirmDeliveryOrdersParamsReqDto,
} from '../dtos/confirm-delivery-orders.dto';
import { ConfirmDeliveryOrdersUsecase } from '../../domain/usecases/confirm_delivery_orders.usecase';
import { DeleteDeliveryOrdersUsecase } from '../../domain/usecases/delete_delivery_orders.usecase';
import {
  SortDeliveryOrdersBodyReqDto,
  SortDeliveryOrdersParamsReqDto,
} from '../dtos/sort-delivery-orders.dto';
import { SortDeliveryOrdersUsecase } from '../../domain/usecases/sort_delivery_orders.usecase';
import {
  ConfirmSortedDeliveryOrdersBodyReqDto,
  ConfirmSortedDeliveryOrdersParamsReqDto,
} from '../dtos/confirm-sorted-delivery-orders.dto';
import { ConfirmSortedDeliveryOrdersUsecase } from '../../domain/usecases/confirm-sorted-delivery-orders.usecase';
import { CreateDeliveryRouteWithOrdersBodyReqDto } from '../dtos/create-delivery-route-with-orders.dto';
import { CreateDeliveryRouteWithOrdersUsecase } from '../../domain/usecases/create-delivery-route-with-orders.usecase';
import { DeleteDeliveryRoutesUsecase } from '../../domain/usecases/delete_delivery_routes.usecase';
import {
  GetDeliveryOrdersParamsReqDto,
  GetDeliveryOrdersQueryReqDto,
} from '../dtos/get-delivery-orders.dto';
import { GetDeliveryOrdersUsecase } from '../../domain/usecases/get-delivery-orders.usecase';

@Controller('delivery-route')
@UseGuards(JwtAuthGuard)
export class DeliveryRouteController {
  constructor(
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly getDeliveryOrdersUsecase: GetDeliveryOrdersUsecase,
    private readonly createDeliveryRouteUsecase: CreateDeliveryRouteUsecase,
    private readonly updateDeliveryRouteUsecase: UpdateDeliveryRouteUsecase,
    private readonly deleteDeliveryRoutesUsecase: DeleteDeliveryRoutesUsecase,
    private readonly createDeliveryOrderUsecase: CreateDeliveryOrderUsecase,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
    private readonly deleteDeliveryOrdersUsecase: DeleteDeliveryOrdersUsecase,
    private readonly recheckDeliveryOrdersUsecase: RecheckDeliveryOrdersUsecase,
    private readonly confirmDeliveryOrdersUsecase: ConfirmDeliveryOrdersUsecase,
    private readonly sortDeliveryOrdersUsecase: SortDeliveryOrdersUsecase,
    private readonly confirmSortedDeliveryOrdersUsecase: ConfirmSortedDeliveryOrdersUsecase,
    private readonly createDeliveryRouteWithOrdersUsecase: CreateDeliveryRouteWithOrdersUsecase,
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

  @Post('with-orders')
  async createDeliveryRouteWithOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Body()
    createDeliveryRouteWithOrdersBody: CreateDeliveryRouteWithOrdersBodyReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.createDeliveryRouteWithOrdersUsecase.execute({
        userId: authPayload.userId,
        name: createDeliveryRouteWithOrdersBody.name,
        orders: createDeliveryRouteWithOrdersBody.orders,
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

  @Delete('m')
  async deleteDeliveryRoutes(
    @AuthPayload() authPayload: JwtPayload,
    @Body() deleteDeliveryRoutesBody: DeleteDeliveryRoutesBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.deleteDeliveryRoutesUsecase.execute(
        authPayload.userId,
        deleteDeliveryRoutesBody.deliveryRouteIds,
      ),
    );
  }

  @Get(':deliveryRouteId/delivery-order')
  async getDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param() paramsDto: GetDeliveryOrdersParamsReqDto,
    @Query() queryDto: GetDeliveryOrdersQueryReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.getDeliveryOrdersUsecase.execute({
        keyword: queryDto.keyword,
        deliveryRouteId: paramsDto.deliveryRouteId,
      }),
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

  @Put(':deliveryRouteId/delivery-order/m/recheck')
  async recheckDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param()
    recheckDeliveryOrdersParams: RecheckDeliveryOrdersParamsReqDto,
    @Body()
    recheckDeliveryOrdersBody: RecheckDeliveryOrdersBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.recheckDeliveryOrdersUsecase.execute(
        authPayload.userId,
        recheckDeliveryOrdersParams.deliveryRouteId,
        recheckDeliveryOrdersBody.deliveryOrderIds,
      ),
    );
  }

  @Put(':deliveryRouteId/delivery-order/m/confirm')
  async confirmDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param()
    confirmDeliveryOrdersParams: ConfirmDeliveryOrdersParamsReqDto,
    @Body()
    confirmDeliveryOrdersBody: ConfirmDeliveryOrdersBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.confirmDeliveryOrdersUsecase.execute(
        authPayload.userId,
        confirmDeliveryOrdersParams.deliveryRouteId,
        confirmDeliveryOrdersBody.deliveryOrderIds,
      ),
    );
  }

  @Put(':deliveryRouteId/delivery-order/m/sort')
  async sortDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param() sortDeliveryOrdersParams: SortDeliveryOrdersParamsReqDto,
    @Body() sortDeliveryOrdersBody: SortDeliveryOrdersBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.sortDeliveryOrdersUsecase.execute(
        authPayload.userId,
        sortDeliveryOrdersParams.deliveryRouteId,
        {
          lat: sortDeliveryOrdersBody.source.y,
          long: sortDeliveryOrdersBody.source.x,
        },
      ),
    );
  }

  @Put(':deliveryRouteId/delivery-order/m/confirm-sorted')
  async confirmSortedDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param()
    confirmSortedDeliveryOrdersParams: ConfirmSortedDeliveryOrdersParamsReqDto,
    @Body()
    confirmSortedDeliveryOrdersBody: ConfirmSortedDeliveryOrdersBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.confirmSortedDeliveryOrdersUsecase.execute(
        authPayload.userId,
        confirmSortedDeliveryOrdersParams.deliveryRouteId,
        confirmSortedDeliveryOrdersBody.deliveryOrderIds,
      ),
    );
  }

  @Delete(':deliveryRouteId/delivery-order/m')
  async deleteDeliveryOrders(
    @AuthPayload() authPayload: JwtPayload,
    @Param() deleteDeliveryOrdersParams: DeleteDeliveryOrdersParamsReqDto,
    @Body() deleteDeliveryOrdersBody: DeleteDeliveryOrdersBodyReqDto,
  ): Promise<AppResponse<void>> {
    return AppResponse.ok(
      await this.deleteDeliveryOrdersUsecase.execute(
        authPayload.userId,
        deleteDeliveryOrdersParams.deliveryRouteId,
        deleteDeliveryOrdersBody.deliveryOrderIds,
      ),
    );
  }
}
