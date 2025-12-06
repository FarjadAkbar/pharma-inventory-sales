import { IUsecase } from '@/utils/usecase';

import { SiteCreateInput, SiteCreateOutput } from '@/core/site/use-cases/site-create';
import { SiteDeleteInput, SiteDeleteOutput } from '@/core/site/use-cases/site-delete';
import { SiteGetByIdInput, SiteGetByIdOutput } from '@/core/site/use-cases/site-get-by-id';
import { SiteListInput, SiteListOutput } from '@/core/site/use-cases/site-list';
import { SiteUpdateInput, SiteUpdateOutput } from '@/core/site/use-cases/site-update';

export abstract class ISiteCreateAdapter implements IUsecase {
  abstract execute(input: SiteCreateInput, trace: any): Promise<SiteCreateOutput>;
}

export abstract class ISiteUpdateAdapter implements IUsecase {
  abstract execute(input: SiteUpdateInput, trace: any): Promise<SiteUpdateOutput>;
}

export abstract class ISiteDeleteAdapter implements IUsecase {
  abstract execute(input: SiteDeleteInput, trace: any): Promise<SiteDeleteOutput>;
}

export abstract class ISiteListAdapter implements IUsecase {
  abstract execute(input: SiteListInput): Promise<SiteListOutput>;
}

export abstract class ISiteGetByIdAdapter implements IUsecase {
  abstract execute(input: SiteGetByIdInput): Promise<SiteGetByIdOutput>;
}
