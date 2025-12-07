import { IRepository } from '@pharma/infra/repository';

import { SiteEntity } from '../entity/site';

export abstract class ISiteRepository extends IRepository<SiteEntity> {}
