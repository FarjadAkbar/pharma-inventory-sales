import { IRepository } from '@/infra/repository';

import { QCTestEntity } from '../entity/qc-test';

export abstract class IQCTestRepository extends IRepository<QCTestEntity> {
  abstract list(input: QCTestListInput): Promise<{ docs: QCTestEntity[]; limit: number; page: number; total: number }>;
}

export type QCTestListInput = {
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
  materialType?: string;
};
