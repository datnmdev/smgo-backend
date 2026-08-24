import { Injectable } from '@nestjs/common';
import {
  DeliveryOrderRepository,
  FindDeliveryOrdersByQuery,
} from '../repositories/delivery-order.repository';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { GetPresignedDownloadUrlUsecase } from '@/modules/storage/domain/usecases/get-presigned-download-url.usecase';

@Injectable()
export class GetDeliveryOrdersUsecase {
  constructor(
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly getPresignedDownloadUrlUsecase: GetPresignedDownloadUrlUsecase,
  ) {}

  async execute(
    query?: FindDeliveryOrdersByQuery,
  ): Promise<TDeliveryOrderIncludeOrderMediaUrl> {
    const res = await this.deliveryOrderRepo.findByQuery(query);
    return Promise.all(
      (res as TDeliveryOrderIncludeOrderMediaUrl).map(async (order) => {
        let orderMediaUrl = null;
        if (order.orderMediaId != null) {
          try {
            orderMediaUrl = await this.getPresignedDownloadUrlUsecase.execute(
              order.orderMediaId,
            );
          } catch {}
        }
        return {
          ...order,
          orderMediaUrl,
        };
      }),
    );
  }
}

export type TDeliveryOrderIncludeOrderMediaUrl = Array<
  TDeliveryOrder & { orderMediaUrl: string }
>;
