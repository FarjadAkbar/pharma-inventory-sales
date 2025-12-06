import { EntitySchema } from 'typeorm';

import { SiteEntity } from '@/core/site/entity/site';
import { BaseSchema } from '@/infra/database/postgres/schemas/base';

export const SiteSchema = new EntitySchema<SiteEntity>({
  name: 'SiteEntity',
  tableName: 'sites',
  target: SiteEntity,
  columns: {
    ...BaseSchema,
    name: {
      type: String,
      nullable: false
    },
    location: {
      type: String,
      nullable: true
    },
    active: {
      type: Boolean,
      default: true
    }
  }
});
