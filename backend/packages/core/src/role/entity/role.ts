import { PermissionEntity, PermissionEntitySchema } from '../../permission/entity/permission';
import { RoleEnum } from '@pharma/utils/constants';
import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

// Re-export RoleEnum for backward compatibility
export { RoleEnum };

const ID = InputValidator.string().uuid();
const Name = InputValidator.string().transform((value) => value.trim().replace(/ /g, '_').toUpperCase());
const Permissions = InputValidator.array(PermissionEntitySchema).optional();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().optional().nullish();

export const RoleEntitySchema = InputValidator.object({
  id: ID,
  name: Name,
  permissions: Permissions,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Role = Infer<typeof RoleEntitySchema>;

export class RoleEntity extends BaseEntity<RoleEntity>() {
  name!: RoleEnum;

  permissions!: PermissionEntity[];

  constructor(entity: Role) {
    super(RoleEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
