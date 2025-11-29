import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const DeviationNumber = InputValidator.string().min(1).max(50);
const Title = InputValidator.string().min(1).max(255);
const Description = InputValidator.string();
const Severity = InputValidator.enum(['Low', 'Medium', 'High', 'Critical']);
const Status = InputValidator.enum(['Open', 'Investigating', 'Resolved', 'Closed']);
const RootCause = InputValidator.string().optional();
const CorrectiveActions = InputValidator.string(); // JSON string
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();

export const DeviationEntitySchema = InputValidator.object({
  id: ID,
  deviationNumber: DeviationNumber,
  title: Title,
  description: Description,
  severity: Severity,
  status: Status,
  rootCause: RootCause,
  correctiveActions: CorrectiveActions,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type Deviation = Infer<typeof DeviationEntitySchema>;

export class DeviationEntity extends BaseEntity<DeviationEntity>() {
  deviationNumber!: string;
  title!: string;
  description!: string;
  severity!: 'Low' | 'Medium' | 'High' | 'Critical';
  status!: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  rootCause?: string;
  correctiveActions!: string; // JSON string

  constructor(entity: Deviation) {
    super(DeviationEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum DeviationSeverityEnum {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum DeviationStatusEnum {
  OPEN = 'Open',
  INVESTIGATING = 'Investigating',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}
