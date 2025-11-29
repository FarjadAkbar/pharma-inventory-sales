import { IRepository } from '@/infra/repository';

import { DeviationEntity } from '../entity/deviation';

export abstract class IDeviationRepository extends IRepository<DeviationEntity> {
  abstract findByDeviationNumber(deviationNumber: string): Promise<DeviationEntity | null>;
  abstract close(id: string): Promise<{ id: string; updated: boolean }>;
  abstract list(input: DeviationListInput): Promise<{ docs: DeviationEntity[]; limit: number; page: number; total: number }>;
}

export type DeviationListInput = {
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
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
};
