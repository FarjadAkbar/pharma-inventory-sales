import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCSampleEntity, QCSampleEntitySchema, QCSampleStatusEnum, QCSamplePriorityEnum } from '../entity/qc-sample';
import { IQCSampleRepository } from '../repository/qc-sample';

export const QCSampleCreateSchema = QCSampleEntitySchema.pick({
  sampleNumber: true,
  sourceType: true,
  sourceId: true,
  materialId: true,
  priority: true,
  assignedTo: true
}).merge(
  InputValidator.object({
    status: InputValidator.enum(QCSampleStatusEnum).optional().default(QCSampleStatusEnum.PENDING)
  })
);

export class QCSampleCreateUsecase implements IUsecase {
  constructor(
    private readonly qcSampleRepository: IQCSampleRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(QCSampleCreateSchema)
  async execute(input: QCSampleCreateInput, { tracing, user }: ApiTrancingInput): Promise<QCSampleCreateOutput> {
    const sampleExists = await this.qcSampleRepository.findBySampleNumber(input.sampleNumber);

    if (sampleExists) {
      throw new ApiConflictException('sampleNumberExists');
    }

    const entity = new QCSampleEntity({
      id: UUIDUtils.create(),
      sampleNumber: input.sampleNumber,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      materialId: input.materialId,
      status: input.status || QCSampleStatusEnum.PENDING,
      priority: input.priority,
      assignedTo: input.assignedTo
    });

    const sample = await this.qcSampleRepository.create(entity);

    this.loggerService.info({ message: 'QC sample created successfully', obj: { sample } });

    tracing.logEvent('qc-sample-created', `Sample: ${entity.sampleNumber} created by: ${user.email}`);

    return sample;
  }
}

export type QCSampleCreateInput = Infer<typeof QCSampleCreateSchema>;
export type QCSampleCreateOutput = CreatedModel;
