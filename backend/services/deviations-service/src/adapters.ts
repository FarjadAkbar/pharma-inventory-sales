import { DeviationCreateInput, DeviationCreateOutput } from '@pharma/core/deviation/use-cases/deviation-create';
import { DeviationUpdateInput, DeviationUpdateOutput } from '@pharma/core/deviation/use-cases/deviation-update';
import { DeviationListOutput } from '@pharma/core/deviation/use-cases/deviation-list';
import { DeviationCloseInput, DeviationCloseOutput } from '@pharma/core/deviation/use-cases/deviation-close';
import { DeviationListInput } from '@pharma/core/deviation/repository/deviation';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

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
