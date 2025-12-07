import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

import { SiteEntity, SiteEntitySchema } from '../entity/site';
import { ISiteRepository } from '../repository/site';

export const SiteCreateSchema = SiteEntitySchema.pick({
  name: true,
  location: true,
  active: true
});

export class SiteCreateUsecase implements IUsecase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @ValidateSchema(SiteCreateSchema)
  async execute(input: SiteCreateInput, { tracing }: ApiTrancingInput): Promise<SiteCreateOutput> {
    const site = new SiteEntity(input as SiteEntity);

    const createdSite = await this.siteRepository.create(site);

    tracing.logEvent('site-created', `Site created: ${site.name}`);

    return site;
  }
}

export type SiteCreateInput = Infer<typeof SiteCreateSchema>;
export type SiteCreateOutput = SiteEntity;
