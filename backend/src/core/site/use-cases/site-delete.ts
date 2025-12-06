import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer } from '@/utils/validator';

import { SiteEntitySchema } from '../entity/site';
import { ISiteRepository } from '../repository/site';

export const SiteDeleteSchema = SiteEntitySchema.pick({
  id: true
});

export class SiteDeleteUsecase implements IUsecase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @ValidateSchema(SiteDeleteSchema)
  async execute(input: SiteDeleteInput, { tracing }: ApiTrancingInput): Promise<SiteDeleteOutput> {
    const site = await this.siteRepository.findById(input.id);

    if (!site) {
      throw new ApiNotFoundException('siteNotFound');
    }

    await this.siteRepository.delete(site);

    tracing.logEvent('site-deleted', `Site deleted: ${site.name}`);

    return site;
  }
}

export type SiteDeleteInput = Infer<typeof SiteDeleteSchema>;
export type SiteDeleteOutput = void;
