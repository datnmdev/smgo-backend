import { Module } from '@nestjs/common';
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
import { DeleteDeliveryOrderUsecase } from './domain/usecases/delete-delivery-order.usecase';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryRouteModel, DeliveryOrderModel]),
    StorageModule,
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
    GetDeliveryOrdersUsecase,
    CreateDeliveryOrderUsecase,
    UpdateDeliveryOrderUsecase,
    DeleteDeliveryOrderUsecase,
  ],
  exports: [],
})
export class DeliveryRouteModule {}
