import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const BatchNumber = InputValidator.string().min(1).max(50);
const DrugId = InputValidator.string().uuid();
const PlannedQuantity = InputValidator.number().min(0);
const ActualQuantity = InputValidator.number().min(0);
const Status = InputValidator.enum(['Planned', 'InProgress', 'Completed', 'Cancelled']);
const StartDate = InputValidator.date().optional();
const EndDate = InputValidator.date().optional();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const BatchEntitySchema = InputValidator.object({
  id: ID,
  batchNumber: BatchNumber,
  drugId: DrugId,
  plannedQuantity: PlannedQuantity,
  actualQuantity: ActualQuantity,
  status: Status,
  startDate: StartDate,
  endDate: EndDate,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Batch = Infer<typeof BatchEntitySchema>;

export class BatchEntity extends BaseEntity<BatchEntity>() {
  batchNumber!: string;
  drugId!: string;
  plannedQuantity!: number;
  actualQuantity!: number;
  status!: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  startDate?: Date;
  endDate?: Date;

  constructor(entity: Batch) {
    super(BatchEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum BatchStatusEnum {
  PLANNED = 'Planned',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}
