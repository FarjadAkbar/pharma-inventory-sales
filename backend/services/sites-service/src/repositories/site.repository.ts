import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { SiteEntity } from '@pharma/core/site/entity/site';
import { ISiteRepository } from '@pharma/core/site/repository/site';
import { SiteSchema } from '@pharma/infra/database/postgres/schemas/site';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';

type Model = SiteSchema & SiteEntity;
@Injectable()
export class SiteRepository extends TypeORMRepository<Model> implements ISiteRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }
}
