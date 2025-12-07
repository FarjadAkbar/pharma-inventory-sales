import { ILoggerAdapter } from '@pharma/infra/logger';
import { UpdatedEntity } from '@pharma/utils/entity';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { SupplierEntity, SupplierEntitySchema, SupplierStatusEnum } from '../entity/supplier';
import { ISupplierRepository } from '../repository/supplier';

export const SupplierUpdateSchema = SupplierEntitySchema.pick({
  id: true,
  name: true,
  contactPerson: true,
  email: true,
  phone: true,
  address: true
}).merge(
  InputValidator.object({
    rating: InputValidator.number().min(0).max(5).optional(),
    status: InputValidator.enum(SupplierStatusEnum).optional()
  })
);

export class SupplierUpdateUsecase implements IUsecase {
  constructor(
    private readonly supplierRepository: ISupplierRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(SupplierUpdateSchema)
  async execute(input: SupplierUpdateInput, { tracing, user }: ApiTrancingInput): Promise<SupplierUpdateOutput> {
    const supplierExists = await this.supplierRepository.findById(input.id);

    if (!supplierExists) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    const entity = new SupplierEntity({
      ...supplierExists,
      ...input
    });

    await this.supplierRepository.updateOne({ id: input.id }, entity);

    this.loggerService.info({ message: 'supplier updated successfully', obj: { supplier: entity } });

    tracing.logEvent('supplier-updated', `supplier: ${entity.id} updated by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type SupplierUpdateInput = Infer<typeof SupplierUpdateSchema>;
export type SupplierUpdateOutput = UpdatedEntity;
