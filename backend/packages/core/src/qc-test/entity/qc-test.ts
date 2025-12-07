import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const Name = InputValidator.string().min(1).max(255);
const Description = InputValidator.string();
const MaterialType = InputValidator.string();
const Specifications = InputValidator.string(); // JSON string
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const QCTestEntitySchema = InputValidator.object({
  id: ID,
  name: Name,
  description: Description,
  materialType: MaterialType,
  specifications: Specifications,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type QCTest = Infer<typeof QCTestEntitySchema>;

export class QCTestEntity extends BaseEntity<QCTestEntity>() {
  name!: string;
  description!: string;
  materialType!: string;
  specifications!: string; // JSON string

  constructor(entity: QCTest) {
    super(QCTestEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
