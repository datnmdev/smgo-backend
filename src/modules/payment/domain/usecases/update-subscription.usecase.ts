import { Injectable } from '@nestjs/common';
import {
  SubscriptionRepository,
  UpdateSubscriptionData,
} from '../repositories/subscription.repository';

@Injectable()
export class UpdateSubscriptionUsecase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(
    subscriptionId: string,
    data: UpdateSubscriptionData,
    manager?: any,
  ): Promise<void> {
    await this.subscriptionRepo.updateSubscription(
      subscriptionId,
      data,
      manager,
    );
  }
}
