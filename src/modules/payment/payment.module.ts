import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModel } from './data/models/subscription.model';
import { PaymentTransactionModel } from './data/models/payment-transaction.model';
import { SubscriptionRepository } from './domain/repositories/subscription.repository';
import { SubscriptionRepositoryImpl } from './data/repositories/subscription.repository.impl';
import { PaymentTransactionRepository } from './domain/repositories/payment_transaction.repository';
import { PaymentTransactionRepositoryImpl } from './data/repositories/payment_transaction.repository.impl';
import { VerifySubscriptionUsecase } from './domain/usecases/verify-subscription.usecase';
import { ConfigModule } from '@/core/config/config.module';
import { CreateSubscriptionUsecase } from './domain/usecases/create-subscription.usecase';
import { UpdateSubscriptionUsecase } from './domain/usecases/update-subscription.usecase';
import { CreatePaymentTransactionUsecase } from './domain/usecases/create-payment-transaction.usecase';
import { UnitOfWorkModule } from '@/core/unit-of-work/unit-of-work.module';
import { SubscriptionController } from './presentation/controllers/subscription.controller';
import { GetCurrentSubscriptionUsecase } from './domain/usecases/get-current-subscription.usecase';
import { HandleGooglePlayWebhookUsecase } from './domain/usecases/handle-google-play-webhook.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionModel, PaymentTransactionModel]),
    ConfigModule,
    UnitOfWorkModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    // Repositories
    {
      provide: SubscriptionRepository,
      useClass: SubscriptionRepositoryImpl,
    },
    {
      provide: PaymentTransactionRepository,
      useClass: PaymentTransactionRepositoryImpl,
    },

    // Usecases
    VerifySubscriptionUsecase,
    CreateSubscriptionUsecase,
    UpdateSubscriptionUsecase,
    CreatePaymentTransactionUsecase,
    GetCurrentSubscriptionUsecase,
    HandleGooglePlayWebhookUsecase,
  ],
  exports: [CreateSubscriptionUsecase, GetCurrentSubscriptionUsecase],
})
export class PaymentModule {}
