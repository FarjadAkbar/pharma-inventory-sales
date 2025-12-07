import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCResultEntity, QCResultEntitySchema } from '../entity/qc-result';
import { IQCResultRepository } from '../repository/qc-result';

export const QCResultCreateSchema = QCResultEntitySchema.pick({
  sampleId: true,
  testId: true,
  resultValue: true,
  passed: true,
  testedBy: true,
  testedAt: true,
  remarks: true
});

export class QCResultCreateUsecase implements IUsecase {
  constructor(
    private readonly qcResultRepository: IQCResultRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(QCResultCreateSchema)
  async execute(input: QCResultCreateInput, { tracing, user }: ApiTrancingInput): Promise<QCResultCreateOutput> {
    const entity = new QCResultEntity({
      id: UUIDUtils.create(),
      sampleId: input.sampleId,
      testId: input.testId,
      resultValue: input.resultValue,
      passed: input.passed,
      testedBy: input.testedBy,
      testedAt: input.testedAt,
      remarks: input.remarks
    });

    const result = await this.qcResultRepository.create(entity);

    this.loggerService.info({ message: 'QC result created successfully', obj: { result } });

    tracing.logEvent('qc-result-created', `Result for sample: ${entity.sampleId} created by: ${user.email}`);

    return result;
  }
}

export type QCResultCreateInput = Infer<typeof QCResultCreateSchema>;
export type QCResultCreateOutput = CreatedModel;
