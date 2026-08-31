import { Injectable } from '@nestjs/common';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';
import { DeleteLocationUsecase } from './delete-location.usecase';

@Injectable()
export class DeleteLocationsUsecase {
  constructor(
    private readonly uowService: UnitOfWorkService,
    private readonly deleteLocationUsecase: DeleteLocationUsecase,
  ) {}

  async execute(userId: string, locationIds: string[]): Promise<void> {
    const uowServiceManager = await this.uowService.create(ORMType.TYPEORM);
    await transactionStorage.run(uowServiceManager, async () => {
      try {
        await this.uowService.start();
        for (const locationId of locationIds) {
          await this.deleteLocationUsecase.execute(
            userId,
            locationId,
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
