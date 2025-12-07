import { IRepository } from '@pharma/infra/repository';

import { QCResultEntity } from '../entity/qc-result';

export abstract class IQCResultRepository extends IRepository<QCResultEntity> {
  abstract findBySampleId(sampleId: string): Promise<QCResultEntity[]>;
  abstract list(input: QCResultListInput): Promise<{ docs: QCResultEntity[]; limit: number; page: number; total: number }>;
}

export type QCResultListInput = {
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
  sampleId?: string;
  testId?: string;
  passed?: boolean;
};
