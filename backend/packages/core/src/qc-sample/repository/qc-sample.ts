import { IRepository } from '@/infra/repository';

import { QCSampleEntity } from '../entity/qc-sample';

export abstract class IQCSampleRepository extends IRepository<QCSampleEntity> {
  abstract findBySampleNumber(sampleNumber: string): Promise<QCSampleEntity | null>;
  abstract assign(id: string, userId: string): Promise<{ id: string; updated: boolean }>;
  abstract complete(id: string): Promise<{ id: string; updated: boolean }>;
  abstract fail(id: string): Promise<{ id: string; updated: boolean }>;
  abstract list(input: QCSampleListInput): Promise<{ docs: QCSampleEntity[]; limit: number; page: number; total: number }>;
}

export type QCSampleListInput = {
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
  status?: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  priority?: 'Low' | 'Medium' | 'High';
  assignedTo?: string;
};
