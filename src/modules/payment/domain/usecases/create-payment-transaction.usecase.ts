import { Injectable } from '@nestjs/common';
import {
  CreatePaymentTransactionData,
  PaymentTransactionRepository,
} from '../repositories/payment_transaction.repository';
import { TPaymentTransaction } from '../entities/payment-transaction.entity';

@Injectable()
export class CreatePaymentTransactionUsecase {
  constructor(
    private readonly paymentTransactionRepo: PaymentTransactionRepository,
  ) {}

  execute(
    data: CreatePaymentTransactionData,
    manager?: any,
  ): Promise<TPaymentTransaction> {
    return this.paymentTransactionRepo.createPaymentTransaction(data, manager);
  }
}
