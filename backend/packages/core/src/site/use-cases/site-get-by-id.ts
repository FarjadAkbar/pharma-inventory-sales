import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

import { SiteEntity, SiteEntitySchema } from '../entity/site';
import { ISiteRepository } from '../repository/site';

export const SiteGetByIdSchema = SiteEntitySchema.pick({
  id: true
});

export class SiteGetByIdUsecase implements IUsecase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @ValidateSchema(SiteGetByIdSchema)
  async execute(input: SiteGetByIdInput): Promise<SiteGetByIdOutput> {
    const site = await this.siteRepository.findById(input.id);

    if (!site) {
      throw new ApiNotFoundException('siteNotFound');
    }

    return site;
  }
}

export type SiteGetByIdInput = Infer<typeof SiteGetByIdSchema>;
export type SiteGetByIdOutput = SiteEntity;
