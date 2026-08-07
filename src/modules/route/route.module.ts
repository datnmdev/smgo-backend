import { Module } from '@nestjs/common';
import { RouteController } from './presentation/controllers/route.controller';
import { GetRoutesUsecase } from './domain/usecases/get-routes.usecase';
import { CreateRouteUsecase } from './domain/usecases/create-route.usecase';
import { UpdateRouteUsecase } from './domain/usecases/update-route.usecase';
import { DeleteRouteUsecase } from './domain/usecases/delete-route.usecase';
import { RoutesRepository } from './domain/repositories/routes.repository';
import { PostgresRoutesRepository } from './data/storages/postgre/repositories/routes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routes } from './data/storages/postgre/entities/routes.entity';
import { RouteStops } from './data/storages/postgre/entities/route-stops.entity';
import { GetRouteStopsUsecase } from './domain/usecases/get-route-stops.usecase';
import { CreateRouteStopUsecase } from './domain/usecases/create-route-stop.usecase';
import { UpdateRouteStopUsecase } from './domain/usecases/update-route-stop.usecase';
import { DeleteRouteStopUsecase } from './domain/usecases/delete-route-stop.usecase';
import { RouteStopsRepository } from './domain/repositories/route-stops.repository';
import { PostgresRouteStopsRepository } from './data/storages/postgre/repositories/route-stops.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Routes,
      RouteStops
    ])
  ],
  controllers: [RouteController],
  providers: [
    // Repositories
    {
      provide: RoutesRepository,
      useClass: PostgresRoutesRepository,
    },
    {
      provide: RouteStopsRepository,
      useClass: PostgresRouteStopsRepository,
    },

    // Usecase
    GetRoutesUsecase,
    CreateRouteUsecase,
    UpdateRouteUsecase,
    DeleteRouteUsecase,
    GetRouteStopsUsecase,
    CreateRouteStopUsecase,
    UpdateRouteStopUsecase,
    DeleteRouteStopUsecase
  ],
  exports: [],
})
export class RouteModule {}
