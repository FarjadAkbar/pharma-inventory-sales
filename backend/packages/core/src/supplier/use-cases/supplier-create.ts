import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { SupplierEntity, SupplierEntitySchema, SupplierStatusEnum } from '../entity/supplier';
import { ISupplierRepository } from '../repository/supplier';

export const SupplierCreateSchema = SupplierEntitySchema.pick({
  name: true,
  contactPerson: true,
  email: true,
  phone: true,
  address: true
}).merge(
  InputValidator.object({
    rating: InputValidator.number().min(0).max(5).optional().default(0),
    status: InputValidator.enum(SupplierStatusEnum).optional().default(SupplierStatusEnum.ACTIVE)
  })
);

export class SupplierCreateUsecase implements IUsecase {
  constructor(
    private readonly supplierRepository: ISupplierRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(SupplierCreateSchema)
  async execute(input: SupplierCreateInput, { tracing, user }: ApiTrancingInput): Promise<SupplierCreateOutput> {
    const entity = new SupplierEntity({
      id: UUIDUtils.create(),
      name: input.name,
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
      address: input.address,
      rating: input.rating || 0,
      status: input.status || SupplierStatusEnum.ACTIVE
    });

    const supplierExists = await this.supplierRepository.findByEmail(entity.email);

    if (supplierExists) {
      throw new ApiConflictException('supplierExists');
    }

    const supplier = await this.supplierRepository.create(entity);

    this.loggerService.info({ message: 'supplier created successfully', obj: { supplier } });

    tracing.logEvent('supplier-created', `supplier: ${entity.email} created by: ${user.email}`);

    return supplier;
  }
}

export type SupplierCreateInput = Infer<typeof SupplierCreateSchema>;
export type SupplierCreateOutput = CreatedModel;
