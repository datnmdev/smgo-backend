import { Injectable } from '@nestjs/common';
import {
  DeliveryOrderRepository,
  FindDeliveryOrdersByQuery,
} from '../repositories/delivery-order.repository';
import { TDeliveryOrder } from '../entities/delivery-order.entity';
import { GetPresignedDownloadUrlUsecase } from '@/modules/storage/domain/usecases/get-presigned-download-url.usecase';
import { GetLocationsUsecase } from '@/modules/user/domain/usecases/get-locations.usecase';

@Injectable()
export class GetDeliveryOrdersUsecase {
  constructor(
    private readonly deliveryOrderRepo: DeliveryOrderRepository,
    private readonly getPresignedDownloadUrlUsecase: GetPresignedDownloadUrlUsecase,
    private readonly getLocationsUsecase: GetLocationsUsecase,
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
          appliedLocation:
            order.appliedLocationId !== null
              ? ((
                  await this.getLocationsUsecase.execute({
                    pageNumber: 1,
                    pageSize: 1,
                    id: order.appliedLocationId,
                  })
                ).data?.[0] ?? null)
              : null,
        };
      }),
    );
  }
}

export type TDeliveryOrderIncludeOrderMediaUrl = Array<
  TDeliveryOrder & {
    orderMediaUrl: string;
    appliedLocation: {
      id: string;
      locationName: string;
      contactName: string;
      contactPhone: string;
      address: string;
      location: {
        x: number;
        y: number;
      };
      userId: string;
      mediaIds: string[];
      note: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      media: Array<{ id: string; url: string }>;
    };
  }
>;
