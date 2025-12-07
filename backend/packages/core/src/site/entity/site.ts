import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const Name = InputValidator.string().min(1);
const Location = InputValidator.string().optional();
const Active = InputValidator.boolean().default(true);
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const SiteEntitySchema = InputValidator.object({
  id: ID,
  name: Name,
  location: Location,
  active: Active,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Site = Infer<typeof SiteEntitySchema>;

export class SiteEntity extends BaseEntity<SiteEntity>() {
  name!: string;
  location?: string;
  active!: boolean;

  constructor(entity: Site) {
    super(SiteEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
