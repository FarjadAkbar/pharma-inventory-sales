import { ILoggerAdapter } from '@/infra/logger';
import { CreatedModel } from '@/infra/repository';
import { IEventAdapter } from '@/libs/event';
import { ValidateSchema } from '@/utils/decorators';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { UUIDUtils } from '@/utils/uuid';
import { Infer, InputValidator } from '@/utils/validator';

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
