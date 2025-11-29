import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const Name = InputValidator.string().min(1).max(255);
const ContactPerson = InputValidator.string().min(1).max(255);
const Email = InputValidator.string().email();
const Phone = InputValidator.string().min(1).max(50);
const Address = InputValidator.string().min(1);
const Rating = InputValidator.number().min(0).max(5);
const Status = InputValidator.enum(['Active', 'Inactive']);
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const SupplierEntitySchema = InputValidator.object({
  id: ID,
  name: Name,
  contactPerson: ContactPerson,
  email: Email,
  phone: Phone,
  address: Address,
  rating: Rating,
  status: Status,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Supplier = Infer<typeof SupplierEntitySchema>;

export class SupplierEntity extends BaseEntity<SupplierEntity>() {
  name!: string;

  contactPerson!: string;

  email!: string;

  phone!: string;

  address!: string;

  rating!: number;

  status!: 'Active' | 'Inactive';

  constructor(entity: Supplier) {
    super(SupplierEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum SupplierStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}
