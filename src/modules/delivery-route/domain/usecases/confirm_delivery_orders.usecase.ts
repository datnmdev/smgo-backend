import { Injectable } from '@nestjs/common';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { UpdateDeliveryOrderUsecase } from './update-delivery-order.usecase';

@Injectable()
export class ConfirmDeliveryOrdersUsecase {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly updateDeliveryOrderUsecase: UpdateDeliveryOrderUsecase,
  ) {}

  async execute(
    userId: string,
    deliveryRouteId: string,
    deliveryOrderIds: string[],
  ): Promise<void> {
    const uowServiceManager = await this.uowService.create(ORMType.TYPEORM);
    await transactionStorage.run(uowServiceManager, async () => {
      try {
        await this.uowService.start();
        await Promise.all(
          deliveryOrderIds.map((deliveryOrderId) =>
            this.updateDeliveryOrderUsecase.execute(
              userId,
              deliveryRouteId,
              deliveryOrderId,
              {
                status: 'checked',
              },
              uowServiceManager.manager,
            ),
          ),
        );
        await this.uowService.commit();
      } catch (error) {
        await this.uowService.rollback();
        throw error;
      } finally {
        await this.uowService.release();
      }
    });
  }
}
