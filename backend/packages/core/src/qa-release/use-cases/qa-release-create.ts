import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QAReleaseEntity, QAReleaseEntitySchema, QAReleaseDecisionEnum } from '../entity/qa-release';
import { IQAReleaseRepository } from '../repository/qa-release';

export const QAReleaseCreateSchema = QAReleaseEntitySchema.pick({
  entityType: true,
  entityId: true,
  decision: true,
  qcSampleId: true,
  remarks: true,
  releasedBy: true,
  releasedAt: true
});

export class QAReleaseCreateUsecase implements IUsecase {
  constructor(
    private readonly qaReleaseRepository: IQAReleaseRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(QAReleaseCreateSchema)
  async execute(input: QAReleaseCreateInput, { tracing, user }: ApiTrancingInput): Promise<QAReleaseCreateOutput> {
    const entity = new QAReleaseEntity({
      id: UUIDUtils.create(),
      entityType: input.entityType,
      entityId: input.entityId,
      decision: input.decision,
      qcSampleId: input.qcSampleId,
      remarks: input.remarks,
      releasedBy: input.releasedBy,
      releasedAt: input.releasedAt
    });

    const release = await this.qaReleaseRepository.create(entity);

    this.loggerService.info({ message: 'QA release created successfully', obj: { release } });

    tracing.logEvent('qa-release-created', `Release decision: ${entity.decision} for ${entity.entityType}:${entity.entityId} by: ${user.email}`);

    return release;
  }
}

export type QAReleaseCreateInput = Infer<typeof QAReleaseCreateSchema>;
export type QAReleaseCreateOutput = CreatedModel;
