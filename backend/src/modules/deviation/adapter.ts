import { DeviationCreateInput, DeviationCreateOutput } from '@/core/deviation/use-cases/deviation-create';
import { DeviationUpdateInput, DeviationUpdateOutput } from '@/core/deviation/use-cases/deviation-update';
import { DeviationListOutput } from '@/core/deviation/use-cases/deviation-list';
import { DeviationCloseInput, DeviationCloseOutput } from '@/core/deviation/use-cases/deviation-close';
import { DeviationListInput } from '@/core/deviation/repository/deviation';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IDeviationCreateAdapter implements IUsecase {
  abstract execute(input: DeviationCreateInput, trace: ApiTrancingInput): Promise<DeviationCreateOutput>;
}

export abstract class IDeviationUpdateAdapter implements IUsecase {
  abstract execute(input: DeviationUpdateInput, trace: ApiTrancingInput): Promise<DeviationUpdateOutput>;
}

export abstract class IDeviationListAdapter implements IUsecase {
  abstract execute(input: DeviationListInput): Promise<DeviationListOutput>;
}

export abstract class IDeviationCloseAdapter implements IUsecase {
  abstract execute(input: DeviationCloseInput, trace: ApiTrancingInput): Promise<DeviationCloseOutput>;
}
