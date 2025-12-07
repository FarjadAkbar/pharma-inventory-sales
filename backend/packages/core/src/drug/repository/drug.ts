import { IRepository } from '@pharma/infra/repository';

import { DrugEntity } from '../entity/drug';

export abstract class IDrugRepository extends IRepository<DrugEntity> {
  abstract findByCode(code: string): Promise<DrugEntity | null>;
  abstract approve(id: string): Promise<{ id: string; updated: boolean }>;
  abstract reject(id: string): Promise<{ id: string; updated: boolean }>;
  abstract list(input: DrugListInput): Promise<{ docs: DrugEntity[]; limit: number; page: number; total: number }>;
}

export type DrugListInput = {
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
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
};
