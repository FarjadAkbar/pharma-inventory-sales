import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCTestEntity, QCTestEntitySchema } from '../entity/qc-test';
import { IQCTestRepository } from '../repository/qc-test';

export const QCTestCreateSchema = QCTestEntitySchema.pick({
  name: true,
  description: true,
  materialType: true,
  specifications: true
});

export class QCTestCreateUsecase implements IUsecase {
  constructor(
    private readonly qcTestRepository: IQCTestRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(QCTestCreateSchema)
  async execute(input: QCTestCreateInput, { tracing, user }: ApiTrancingInput): Promise<QCTestCreateOutput> {
    const entity = new QCTestEntity({
      id: UUIDUtils.create(),
      name: input.name,
      description: input.description,
      materialType: input.materialType,
      specifications: input.specifications
    });

    const test = await this.qcTestRepository.create(entity);

    this.loggerService.info({ message: 'QC test created successfully', obj: { test } });

    tracing.logEvent('qc-test-created', `Test: ${entity.name} created by: ${user.email}`);

    return test;
  }
}

export type QCTestCreateInput = Infer<typeof QCTestCreateSchema>;
export type QCTestCreateOutput = CreatedModel;
