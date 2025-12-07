import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const SampleNumber = InputValidator.string().min(1).max(50);
const SourceType = InputValidator.enum(['GoodsReceipt', 'Batch']);
const SourceId = InputValidator.string().uuid();
const MaterialId = InputValidator.string().uuid();
const Status = InputValidator.enum(['Pending', 'InProgress', 'Completed', 'Failed']);
const Priority = InputValidator.enum(['Low', 'Medium', 'High']);
const AssignedTo = InputValidator.string().uuid().optional();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();

export const QCSampleEntitySchema = InputValidator.object({
  id: ID,
  sampleNumber: SampleNumber,
  sourceType: SourceType,
  sourceId: SourceId,
  materialId: MaterialId,
  status: Status,
  priority: Priority,
  assignedTo: AssignedTo,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type QCSample = Infer<typeof QCSampleEntitySchema>;

export class QCSampleEntity extends BaseEntity<QCSampleEntity>() {
  sampleNumber!: string;
  sourceType!: 'GoodsReceipt' | 'Batch';
  sourceId!: string;
  materialId!: string;
  status!: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  priority!: 'Low' | 'Medium' | 'High';
  assignedTo?: string;

  constructor(entity: QCSample) {
    super(QCSampleEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum QCSampleStatusEnum {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

export enum QCSamplePriorityEnum {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}
