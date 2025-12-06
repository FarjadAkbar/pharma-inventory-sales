import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

import { SiteEntity } from '@/core/site/entity/site';
import { ISiteRepository } from '@/core/site/repository/site';
import { TypeORMRepository } from '@/infra/repository';

import { SiteSchema } from '../../infra/database/postgres/schemas/site';

@Injectable()
export class SiteRepository extends TypeORMRepository<SiteEntity> implements ISiteRepository {
  constructor(
    @InjectRepository(SiteSchema)
    readonly repository: TypeOrmRepository<SiteEntity>
  ) {
    super(repository);
  }
}
