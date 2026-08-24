import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

export const transactionStorage = new AsyncLocalStorage<UnitOfWorkManager>();

@Injectable()
export class UnitOfWorkService implements IUnitOfWork {
  constructor(private dataSource: DataSource) {}

  getManager(): UnitOfWorkManager {
    const qr = transactionStorage.getStore();
    return qr;
  }

  async create(type: ORMType): Promise<UnitOfWorkManager> {
    if (type === ORMType.TYPEORM) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      return {
        type,
        manager: queryRunner,
      };
    }
    throw new Error(`Unsupported ORM type: ${type}`);
  }

  async start(): Promise<void> {
    const uowManager = this.getManager();
    if (!uowManager) {
      throw new Error(
        'No transaction manager found. Ensure that you are running within a transaction context.',
      );
    }
    if (uowManager.type === ORMType.TYPEORM) {
      await (uowManager.manager as QueryRunner).startTransaction();
    }
  }

  async commit(): Promise<void> {
    const uowManager = this.getManager();
    if (!uowManager) {
      throw new Error(
        'No transaction manager found. Ensure that you are running within a transaction context.',
      );
    }
    if (uowManager.type === ORMType.TYPEORM) {
      await (uowManager.manager as QueryRunner).commitTransaction();
    }
  }

  async rollback(): Promise<void> {
    const uowManager = this.getManager();
    if (!uowManager) {
      throw new Error(
        'No transaction manager found. Ensure that you are running within a transaction context.',
      );
    }
    if (uowManager.type === ORMType.TYPEORM) {
      await (uowManager.manager as QueryRunner).rollbackTransaction();
    }
  }

  async release(): Promise<void> {
    const uowManager = this.getManager();
    if (!uowManager) {
      throw new Error(
        'No transaction manager found. Ensure that you are running within a transaction context.',
      );
    }
    if (uowManager.type === ORMType.TYPEORM) {
      await (uowManager.manager as QueryRunner).release();
    }
  }
}

export enum ORMType {
  TYPEORM = 'TYPEORM',
}


export interface UnitOfWorkManager {
  type: ORMType;
  manager: any;
}

export interface IUnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): Promise<void>;
  getManager(): UnitOfWorkManager;
  create(type: ORMType): Promise<UnitOfWorkManager>;
}
