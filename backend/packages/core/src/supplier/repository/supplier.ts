import { IRepository } from '@pharma/infra/repository';

import { SupplierEntity } from '../entity/supplier';

export abstract class ISupplierRepository extends IRepository<SupplierEntity> {
  abstract findByEmail(email: string): Promise<SupplierEntity | null>;
  abstract updateRating(id: string, rating: number): Promise<{ id: string; updated: boolean }>;
  abstract list(input: SupplierListInput): Promise<{ docs: SupplierEntity[]; limit: number; page: number; total: number }>;
}

export type SupplierListInput = {
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
  status?: 'Active' | 'Inactive';
};
