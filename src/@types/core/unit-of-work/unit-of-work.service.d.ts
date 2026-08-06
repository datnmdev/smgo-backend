import { ORMType } from '@/core/enum/unut-of-work.enum';

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

export abstract class IUnitOfWork {}
