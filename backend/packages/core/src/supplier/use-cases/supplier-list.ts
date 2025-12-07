import { ValidateSchema } from '@pharma/utils/decorators';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { SupplierEntity } from '../entity/supplier';
import { ISupplierRepository, SupplierListInput } from '../repository/supplier';

export const SupplierListSchema = InputValidator.object({
  search: InputValidator.object({
    term: InputValidator.string().optional(),
    fields: InputValidator.array(InputValidator.string()).optional()
  }).optional(),
  sort: InputValidator.object({
    field: InputValidator.string(),
    order: InputValidator.enum(['asc', 'desc'])
  }).optional(),
  limit: InputValidator.number().min(1).max(100).optional(),
  page: InputValidator.number().min(1).optional(),
  status: InputValidator.enum(['Active', 'Inactive']).optional()
});

export class SupplierListUsecase implements IUsecase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  @ValidateSchema(SupplierListSchema)
  async execute(input: SupplierListInput): Promise<SupplierListOutput> {
    const suppliers = await this.supplierRepository.list(input);

    return suppliers;
  }
}

export type SupplierListOutput = {
  docs: SupplierEntity[];
  limit: number;
  page: number;
  total: number;
};
