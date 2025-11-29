import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { RawMaterialEntity } from '../entity/raw-material';
import { IRawMaterialRepository, RawMaterialListInput } from '../repository/raw-material';

export const RawMaterialListSchema = InputValidator.object({
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
  supplierId: InputValidator.string().uuid().optional()
});

export class RawMaterialListUsecase implements IUsecase {
  constructor(private readonly rawMaterialRepository: IRawMaterialRepository) {}

  @ValidateSchema(RawMaterialListSchema)
  async execute(input: RawMaterialListInput): Promise<RawMaterialListOutput> {
    const rawMaterials = await this.rawMaterialRepository.list(input);

    return rawMaterials;
  }
}

export type RawMaterialListOutput = {
  docs: RawMaterialEntity[];
  limit: number;
  page: number;
  total: number;
};
