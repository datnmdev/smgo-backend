import { Injectable } from '@nestjs/common';
import {
  CreateSubscriptionData,
  SubscriptionRepository,
} from '../repositories/subscription.repository';
import { TSubscription } from '../entities/subscription.entity';

@Injectable()
export class CreateSubscriptionUsecase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  execute(data: CreateSubscriptionData, manager?: any): Promise<TSubscription> {
    return this.subscriptionRepo.createSubscription(data, manager);
  }
}
