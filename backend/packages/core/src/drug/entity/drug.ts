import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const Code = InputValidator.string().min(1).max(50);
const Name = InputValidator.string().min(1).max(255);
const Formula = InputValidator.string().min(1).max(255);
const Strength = InputValidator.string().min(1).max(100);
const DosageForm = InputValidator.string().min(1).max(100);
const Route = InputValidator.string().min(1).max(100);
const Description = InputValidator.string().min(1);
const ApprovalStatus = InputValidator.enum(['Draft', 'Pending', 'Approved', 'Rejected']);
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const DrugEntitySchema = InputValidator.object({
  id: ID,
  code: Code,
  name: Name,
  formula: Formula,
  strength: Strength,
  dosageForm: DosageForm,
  route: Route,
  description: Description,
  approvalStatus: ApprovalStatus,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Drug = Infer<typeof DrugEntitySchema>;

export class DrugEntity extends BaseEntity<DrugEntity>() {
  code!: string;

  name!: string;

  formula!: string;

  strength!: string;

  dosageForm!: string;

  route!: string;

  description!: string;

  approvalStatus!: 'Draft' | 'Pending' | 'Approved' | 'Rejected';

  constructor(entity: Drug) {
    super(DrugEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum DrugApprovalStatusEnum {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}
