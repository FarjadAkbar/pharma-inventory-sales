import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ISiteRepository } from '@/core/site/repository/site';
import { SiteCreateUsecase } from '@/core/site/use-cases/site-create';
import { SiteDeleteUsecase } from '@/core/site/use-cases/site-delete';
import { SiteGetByIdUsecase } from '@/core/site/use-cases/site-get-by-id';
import { SiteListUsecase } from '@/core/site/use-cases/site-list';
import { SiteUpdateUsecase } from '@/core/site/use-cases/site-update';
import { SiteSchema } from '@/infra/database/postgres/schemas/site';
import { InfraModule } from '@/infra/module';
import { LibModule } from '@/libs/module';

import { SitesController } from './sites.controller';
import {
  ISiteCreateAdapter,
  ISiteDeleteAdapter,
  ISiteGetByIdAdapter,
  ISiteListAdapter,
  ISiteUpdateAdapter
} from './adapters';
import { SiteRepository } from './repositories/site.repository';
import { SiteEntity } from '@/core/site/entity/site';

@Module({
  imports: [InfraModule, LibModule, TypeOrmModule.forFeature([SiteSchema])],
  controllers: [SitesController],
  providers: [
    {
      provide: ISiteRepository,
      useFactory: (repository: Repository<SiteSchema & SiteEntity>) => {
        return new SiteRepository(repository);
      },
      inject: [getRepositoryToken(SiteSchema)]
    },
    {
      provide: ISiteCreateAdapter,
      useFactory: (siteRepository: ISiteRepository) => new SiteCreateUsecase(siteRepository),
      inject: [ISiteRepository]
    },
    {
      provide: ISiteUpdateAdapter,
      useFactory: (siteRepository: ISiteRepository) => new SiteUpdateUsecase(siteRepository),
      inject: [ISiteRepository]
    },
    {
      provide: ISiteDeleteAdapter,
      useFactory: (siteRepository: ISiteRepository) => new SiteDeleteUsecase(siteRepository),
      inject: [ISiteRepository]
    },
    {
      provide: ISiteListAdapter,
      useFactory: (siteRepository: ISiteRepository) => new SiteListUsecase(siteRepository),
      inject: [ISiteRepository]
    },
    {
      provide: ISiteGetByIdAdapter,
      useFactory: (siteRepository: ISiteRepository) => new SiteGetByIdUsecase(siteRepository),
      inject: [ISiteRepository]
    }
  ]
})
export class AppModule {}
