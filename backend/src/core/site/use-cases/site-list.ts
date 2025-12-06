import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { SiteEntity } from '../entity/site';
import { ISiteRepository } from '../repository/site';

export const SiteListSchema = InputValidator.object({
  limit: InputValidator.number().optional(),
  page: InputValidator.number().optional(),
  search: InputValidator.any().optional(),
  sort: InputValidator.any().optional()
});

export class SiteListUsecase implements IUsecase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @ValidateSchema(SiteListSchema)
  async execute(input: SiteListInput): Promise<SiteListOutput> {
    const sites = await this.siteRepository.list(input);
    return sites;
  }
}

export type SiteListInput = Infer<typeof SiteListSchema>;
export type SiteListOutput = { docs: SiteEntity[]; limit: number; page: number; total: number };
