import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

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

    await this.siteRepository.softDelete({ id: site.id });

    tracing.logEvent('site-deleted', `Site deleted: ${site.name}`);
  }
}

export type SiteDeleteInput = Infer<typeof SiteDeleteSchema>;
export type SiteDeleteOutput = void;
