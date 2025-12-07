import { IRepository } from '@pharma/infra/repository';

import { RawMaterialEntity } from '../entity/raw-material';

export abstract class IRawMaterialRepository extends IRepository<RawMaterialEntity> {
  abstract findByCode(code: string): Promise<RawMaterialEntity | null>;
  abstract findBySupplierId(supplierId: string): Promise<RawMaterialEntity[]>;
  abstract list(input: RawMaterialListInput): Promise<{ docs: RawMaterialEntity[]; limit: number; page: number; total: number }>;
}

export type RawMaterialListInput = {
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
  supplierId?: string;
};
