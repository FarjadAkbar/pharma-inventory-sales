import { IRepository } from '@/infra/repository';

import { QAReleaseEntity } from '../entity/qa-release';

export abstract class IQAReleaseRepository extends IRepository<QAReleaseEntity> {
  abstract findByEntityId(entityId: string): Promise<QAReleaseEntity | null>;
  abstract list(input: QAReleaseListInput): Promise<{ docs: QAReleaseEntity[]; limit: number; page: number; total: number }>;
}

export type QAReleaseListInput = {
  limit?: number;
  page?: number;
  search?: {
    term?: string;
    fields?: string[];
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  decision?: 'Release' | 'Reject' | 'Hold';
  entityType?: 'GoodsReceipt' | 'Batch';
};
