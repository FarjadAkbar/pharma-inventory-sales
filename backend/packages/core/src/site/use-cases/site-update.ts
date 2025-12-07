import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

import { SiteEntity, SiteEntitySchema } from '../entity/site';
import { ISiteRepository } from '../repository/site';

export const SiteUpdateSchema = SiteEntitySchema.pick({
  id: true,
  name: true,
  location: true,
  active: true
});

export class SiteUpdateUsecase implements IUsecase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @ValidateSchema(SiteUpdateSchema)
  async execute(input: SiteUpdateInput, { tracing }: ApiTrancingInput): Promise<SiteUpdateOutput> {
    const site = await this.siteRepository.findById(input.id);

    if (!site) {
      throw new ApiNotFoundException('siteNotFound');
    }

    const updatedSite = new SiteEntity({ ...site, ...input });

    await this.siteRepository.updateOne({ id: input.id }, updatedSite);

    tracing.logEvent('site-updated', `Site updated: ${updatedSite.name}`);

    return updatedSite;
  }
}

export type SiteUpdateInput = Infer<typeof SiteUpdateSchema>;
export type SiteUpdateOutput = SiteEntity;
