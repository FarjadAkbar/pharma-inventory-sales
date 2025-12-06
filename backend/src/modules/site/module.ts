import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISiteRepository } from '@/core/site/repository/site';
import { SiteCreateUsecase } from '@/core/site/use-cases/site-create';
import { SiteDeleteUsecase } from '@/core/site/use-cases/site-delete';
import { SiteGetByIdUsecase } from '@/core/site/use-cases/site-get-by-id';
import { SiteListUsecase } from '@/core/site/use-cases/site-list';
import { SiteUpdateUsecase } from '@/core/site/use-cases/site-update';

import {
  ISiteCreateAdapter,
  ISiteDeleteAdapter,
  ISiteGetByIdAdapter,
  ISiteListAdapter,
  ISiteUpdateAdapter
} from './adapter';
import { SiteController } from './controller';
import { SiteRepository } from './repository';
import { SiteSchema } from '../../infra/database/postgres/schemas/site';

const createSiteFactory = {
  provide: ISiteCreateAdapter,
  useFactory: (siteRepository: ISiteRepository) => new SiteCreateUsecase(siteRepository),
  inject: [ISiteRepository]
};

const updateSiteFactory = {
  provide: ISiteUpdateAdapter,
  useFactory: (siteRepository: ISiteRepository) => new SiteUpdateUsecase(siteRepository),
  inject: [ISiteRepository]
};

const deleteSiteFactory = {
  provide: ISiteDeleteAdapter,
  useFactory: (siteRepository: ISiteRepository) => new SiteDeleteUsecase(siteRepository),
  inject: [ISiteRepository]
};

const listSiteFactory = {
  provide: ISiteListAdapter,
  useFactory: (siteRepository: ISiteRepository) => new SiteListUsecase(siteRepository),
  inject: [ISiteRepository]
};

const getByIdSiteFactory = {
  provide: ISiteGetByIdAdapter,
  useFactory: (siteRepository: ISiteRepository) => new SiteGetByIdUsecase(siteRepository),
  inject: [ISiteRepository]
};

const siteRepositoryFactory = {
  provide: ISiteRepository,
  useClass: SiteRepository
};

@Module({
  imports: [TypeOrmModule.forFeature([SiteSchema])],
  controllers: [SiteController],
  providers: [
    createSiteFactory,
    updateSiteFactory,
    deleteSiteFactory,
    listSiteFactory,
    getByIdSiteFactory,
    siteRepositoryFactory
  ] as Provider[],
  exports: []
})
export class SiteModule {}
