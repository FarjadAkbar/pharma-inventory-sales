import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException, ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';
import { ISupplierRepository } from '../../supplier/repository/supplier';

import { RawMaterialEntity, RawMaterialEntitySchema } from '../entity/raw-material';
import { IRawMaterialRepository } from '../repository/raw-material';

export const RawMaterialCreateSchema = RawMaterialEntitySchema.pick({
  code: true,
  name: true,
  grade: true,
  unitOfMeasure: true,
  supplierId: true,
  storageRequirements: true
});

export class RawMaterialCreateUsecase implements IUsecase {
  constructor(
    private readonly rawMaterialRepository: IRawMaterialRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(RawMaterialCreateSchema)
  async execute(input: RawMaterialCreateInput, { tracing, user }: ApiTrancingInput): Promise<RawMaterialCreateOutput> {
    // Verify supplier exists
    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    const entity = new RawMaterialEntity({
      id: UUIDUtils.create(),
      code: input.code,
      name: input.name,
      grade: input.grade,
      unitOfMeasure: input.unitOfMeasure,
      supplierId: input.supplierId,
      storageRequirements: input.storageRequirements
    });

    const rawMaterialExists = await this.rawMaterialRepository.findByCode(entity.code);

    if (rawMaterialExists) {
      throw new ApiConflictException('rawMaterialExists');
    }

    const rawMaterial = await this.rawMaterialRepository.create(entity);

    this.loggerService.info({ message: 'raw material created successfully', obj: { rawMaterial } });

    tracing.logEvent('raw-material-created', `raw material: ${entity.code} created by: ${user.email}`);

    return rawMaterial;
  }
}

export type RawMaterialCreateInput = Infer<typeof RawMaterialCreateSchema>;
export type RawMaterialCreateOutput = CreatedModel;
