import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { TSubscription } from '../entities/subscription.entity';

@Injectable()
export class GetCurrentSubscriptionUsecase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(userId: string): Promise<TSubscription | null> {
    return (
      (await this.subscriptionRepo.getSubscriptions({ userId }))?.[0] ?? null
    );
  }
}
