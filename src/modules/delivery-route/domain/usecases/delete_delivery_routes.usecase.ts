import { Injectable } from '@nestjs/common';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { DeleteDeliveryRouteUsecase } from './delete-delivery-route.usecase';

@Injectable()
export class DeleteDeliveryRoutesUsecase {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly deleteDeliveryRouteUsecase: DeleteDeliveryRouteUsecase,
  ) {}

  async execute(userId: string, deliveryRouteIds: string[]): Promise<void> {
    const uowServiceManager = await this.uowService.create(ORMType.TYPEORM);
    await transactionStorage.run(uowServiceManager, async () => {
      try {
        await this.uowService.start();
        for (const deliveryRouteId of deliveryRouteIds) {
          await this.deleteDeliveryRouteUsecase.execute(
            userId,
            deliveryRouteId,
            uowServiceManager.manager,
          );
        }
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
