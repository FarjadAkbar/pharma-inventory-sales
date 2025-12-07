import { IRepository } from '@pharma/infra/repository';

import { BatchEntity } from '../entity/batch';

export abstract class IBatchRepository extends IRepository<BatchEntity> {
  abstract findByBatchNumber(batchNumber: string): Promise<BatchEntity | null>;
  abstract start(id: string, startDate: Date): Promise<{ id: string; updated: boolean }>;
  abstract complete(id: string, endDate: Date, actualQuantity: number): Promise<{ id: string; updated: boolean }>;
  abstract list(input: BatchListInput): Promise<{ docs: BatchEntity[]; limit: number; page: number; total: number }>;
}

export type BatchListInput = {
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
  status?: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  drugId?: string;
};
