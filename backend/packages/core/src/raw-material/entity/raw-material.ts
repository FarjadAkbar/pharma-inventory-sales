import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const Code = InputValidator.string().min(1).max(50);
const Name = InputValidator.string().min(1).max(255);
const Grade = InputValidator.string().min(1).max(100);
const UnitOfMeasure = InputValidator.string().min(1).max(50);
const SupplierId = InputValidator.string().uuid();
const StorageRequirements = InputValidator.string().min(1);
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const RawMaterialEntitySchema = InputValidator.object({
  id: ID,
  code: Code,
  name: Name,
  grade: Grade,
  unitOfMeasure: UnitOfMeasure,
  supplierId: SupplierId,
  storageRequirements: StorageRequirements,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type RawMaterial = Infer<typeof RawMaterialEntitySchema>;

export class RawMaterialEntity extends BaseEntity<RawMaterialEntity>() {
  code!: string;

  name!: string;

  grade!: string;

  unitOfMeasure!: string;

  supplierId!: string;

  storageRequirements!: string;

  constructor(entity: RawMaterial) {
    super(RawMaterialEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
