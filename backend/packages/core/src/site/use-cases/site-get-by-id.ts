import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { IUsecase } from '@/utils/usecase';
import { Infer } from '@/utils/validator';

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
