import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { SiteEntity } from '@/core/site/entity/site';
import { ISiteRepository } from '@/core/site/repository/site';
import { SiteSchema } from '@/infra/database/postgres/schemas/site';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';

@Injectable()
export class SiteRepository extends TypeORMRepository<SiteEntity> implements ISiteRepository {
  constructor(readonly repository: Repository<SiteEntity>) {
    super(repository);
  }
}
