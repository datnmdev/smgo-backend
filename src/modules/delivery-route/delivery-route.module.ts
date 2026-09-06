import { forwardRef, Module } from '@nestjs/common';
import { DeliveryRouteController } from './presentation/controllers/delivery-route.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryRouteRepository } from './domain/repositories/delivery-route.repository';
import { DeliveryRouteModel } from './data/models/delivery-route.model';
import { DeliveryOrderModel } from './data/models/delivery-order.model';
import { DeliveryRouteRepositoryImpl } from './data/repositories/delivery-route.repository.impl';
import { DeliveryOrderRepository } from './domain/repositories/delivery-order.repository';
import { DeliveryOrderRepositoryImpl } from './data/repositories/delivery-order.repository.impl';
import { GetDeliveryRoutesUsecase } from './domain/usecases/get-delivery-routes.usecase';
import { UpdateDeliveryRouteUsecase } from './domain/usecases/update-delivery-route.usecase';
import { DeleteDeliveryRouteUsecase } from './domain/usecases/delete-delivery-route.usecase';
import { CreateDeliveryRouteUsecase } from './domain/usecases/create-delivery-route.usecase';
import { GetDeliveryOrdersUsecase } from './domain/usecases/get-delivery-orders.usecase';
import { CreateDeliveryOrderUsecase } from './domain/usecases/create-delivery-order.usecase';
import { UpdateDeliveryOrderUsecase } from './domain/usecases/update-delivery-order.usecase';
import { StorageModule } from '../storage/storage.module';
import { RecheckDeliveryOrdersUsecase } from './domain/usecases/recheck-delivery-orders.usecase';
import { UnitOfWorkModule } from '@/core/unit-of-work/unit-of-work.module';
import { ConfirmDeliveryOrdersUsecase } from './domain/usecases/confirm_delivery_orders.usecase';
import { DeleteDeliveryOrdersUsecase } from './domain/usecases/delete_delivery_orders.usecase';
import { ConfigModule } from '@/core/config/config.module';
import { SortDeliveryOrdersUsecase } from './domain/usecases/sort_delivery_orders.usecase';
import { ConfirmSortedDeliveryOrdersUsecase } from './domain/usecases/confirm-sorted-delivery-orders.usecase';
import { CreateDeliveryRouteWithOrdersUsecase } from './domain/usecases/create-delivery-route-with-orders.usecase';
import { DeleteDeliveryRoutesUsecase } from './domain/usecases/delete_delivery_routes.usecase';
import { UserModule } from '../user/user.module';
import { CheckPlanUsecase } from './domain/usecases/check-plan.usecase';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryRouteModel, DeliveryOrderModel]),
    StorageModule,
    UnitOfWorkModule,
    ConfigModule,
    forwardRef(() => UserModule),
    PaymentModule,
  ],
  controllers: [DeliveryRouteController],
  providers: [
    // Repositories
    {
      provide: DeliveryRouteRepository,
      useClass: DeliveryRouteRepositoryImpl,
    },
    {
      provide: DeliveryOrderRepository,
      useClass: DeliveryOrderRepositoryImpl,
    },

    // Usecase
    GetDeliveryRoutesUsecase,
    CreateDeliveryRouteUsecase,
    UpdateDeliveryRouteUsecase,
    DeleteDeliveryRouteUsecase,
    DeleteDeliveryRoutesUsecase,
    GetDeliveryOrdersUsecase,
    CreateDeliveryOrderUsecase,
    UpdateDeliveryOrderUsecase,
    DeleteDeliveryOrdersUsecase,
    RecheckDeliveryOrdersUsecase,
    ConfirmDeliveryOrdersUsecase,
    SortDeliveryOrdersUsecase,
    ConfirmSortedDeliveryOrdersUsecase,
    CreateDeliveryRouteWithOrdersUsecase,
    CheckPlanUsecase,
  ],
  exports: [GetDeliveryRoutesUsecase, GetDeliveryOrdersUsecase],
})
export class DeliveryRouteModule {}
