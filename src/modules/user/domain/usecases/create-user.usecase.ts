import { Injectable } from '@nestjs/common';
import {
  CreateUserData,
  UserRepository,
} from '../repositories/user.repository';
import { TUser } from '../entities/user.entity';
import { CreateSubscriptionUsecase } from '@/modules/payment/domain/usecases/create-subscription.usecase';
import {
  ORMType,
  transactionStorage,
  UnitOfWorkService,
} from '@/core/unit-of-work/unit-of-work.service';

@Injectable()
export class CreateUserUsecase {
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly createSubscriptionUsecase: CreateSubscriptionUsecase,
    private readonly uowService: UnitOfWorkService,
  ) {}

  async execute(data: CreateUserData, manager?: any): Promise<TUser> {
    if (!manager) {
      const uowManager = await this.uowService.create(ORMType.TYPEORM);
      return await transactionStorage.run(uowManager, async () => {
        try {
          await this.uowService.start();
          const newUser = await this._handle(data, uowManager.manager);
          await this.uowService.commit();
          return newUser;
        } catch (error) {
          await this.uowService.rollback();
          throw error;
        } finally {
          await this.uowService.release();
        }
      });
    } else {
      return this._handle(data, manager);
    }
  }

  private async _handle(data: CreateUserData, manager: any): Promise<TUser> {
    const newUser = await this.usersRepo.create(data, manager);
    await this.createSubscriptionUsecase.execute(
      {
        userId: newUser.id,
        productId: 'smgo_basic',
        status: 'ACTIVE',
        startsAt: newUser.createdAt,
      },
      manager,
    );
    return newUser;
  }
}
