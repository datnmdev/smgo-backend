import { Injectable } from '@nestjs/common';
import { ShareLocationTokenRepository } from '../repositories/share-location-token.repository';
import { ConfigService } from '@/core/config/config.service';
import path from 'path';
import { GetDeliveryRoutesUsecase } from '@/modules/delivery-route/domain/usecases/get-delivery-routes.usecase';
import { GetDeliveryOrdersUsecase } from '@/modules/delivery-route/domain/usecases/get-delivery-orders.usecase';
import { DeliveryRouteNotFoundException } from '@/modules/delivery-route/domain/exceptions/delivery-route-not-found.exception';
import { DeliveryOrderNotFoundException } from '@/modules/delivery-route/domain/exceptions/delivery-order-not-found.exception';

@Injectable()
export class GetShareLocationUrlUsecase {
  constructor(
    private readonly shareLocationTokenRepo: ShareLocationTokenRepository,
    private readonly configService: ConfigService,
    private readonly getDeliveryRoutesUsecase: GetDeliveryRoutesUsecase,
    private readonly getDeliveryOrdersUsecase: GetDeliveryOrdersUsecase,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderId: string,
  ): Promise<string> {
    const deliveryRoute = (
      await this.getDeliveryRoutesUsecase.execute({
        userId,
        id: deliveryRouteId,
      })
    ).data?.[0];
    if (!deliveryRoute) {
      throw new DeliveryRouteNotFoundException();
    }
    const deliveryOrder = (
      await this.getDeliveryOrdersUsecase.execute({
        deliveryRouteId,
        id: deliveryOrderId,
      })
    )?.[0];
    if (!deliveryOrder) {
      throw new DeliveryOrderNotFoundException();
    }
    const tokenKey = await this.shareLocationTokenRepo.createTokenKey(
      userId,
      deliveryRouteId,
      deliveryOrderId,
    );
    const queryParams = new URLSearchParams({
      tokenKey,
    });
    return `${this.configService.getServerConfig().serverBaseUrl}/api/location/share/load-page?${queryParams.toString()}`;
  }
}
