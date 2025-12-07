import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const EntityType = InputValidator.enum(['GoodsReceipt', 'Batch']);
const EntityId = InputValidator.string().uuid();
const Decision = InputValidator.enum(['Release', 'Reject', 'Hold']);
const QCSampleId = InputValidator.string().uuid().optional();
const Remarks = InputValidator.string();
const ReleasedBy = InputValidator.string().uuid();
const ReleasedAt = InputValidator.date();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();

export const QAReleaseEntitySchema = InputValidator.object({
  id: ID,
  entityType: EntityType,
  entityId: EntityId,
  decision: Decision,
  qcSampleId: QCSampleId,
  remarks: Remarks,
  releasedBy: ReleasedBy,
  releasedAt: ReleasedAt,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type QARelease = Infer<typeof QAReleaseEntitySchema>;

export class QAReleaseEntity extends BaseEntity<QAReleaseEntity>() {
  entityType!: 'GoodsReceipt' | 'Batch';
  entityId!: string;
  decision!: 'Release' | 'Reject' | 'Hold';
  qcSampleId?: string;
  remarks!: string;
  releasedBy!: string;
  releasedAt!: Date;

  constructor(entity: QARelease) {
    super(QAReleaseEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum QAReleaseDecisionEnum {
  RELEASE = 'Release',
  REJECT = 'Reject',
  HOLD = 'Hold'
}
