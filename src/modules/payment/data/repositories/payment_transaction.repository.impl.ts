import { Injectable } from '@nestjs/common';
import {
  CreatePaymentTransactionData,
  PaymentTransactionRepository,
} from '../../domain/repositories/payment_transaction.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentTransactionModel } from '../models/payment-transaction.model';
import { Repository } from 'typeorm';
import { TPaymentTransaction } from '../../domain/entities/payment-transaction.entity';

@Injectable()
export class PaymentTransactionRepositoryImpl implements PaymentTransactionRepository {
  constructor(
    @InjectRepository(PaymentTransactionModel)
    private readonly paymentTransactionRepo: Repository<PaymentTransactionModel>,
  ) {}

  async createPaymentTransaction(
    data: CreatePaymentTransactionData,
    manager?: any,
  ): Promise<TPaymentTransaction> {
    const repo: Repository<PaymentTransactionModel> = !manager
      ? this.paymentTransactionRepo
      : manager.manager.getRepository(PaymentTransactionModel);
    return repo.save(repo.create(data));
  }
}
