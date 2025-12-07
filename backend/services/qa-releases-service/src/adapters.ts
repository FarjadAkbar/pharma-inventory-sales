import { QAReleaseCreateInput, QAReleaseCreateOutput } from '@pharma/core/qa-release/use-cases/qa-release-create';
import { QAReleaseListOutput } from '@pharma/core/qa-release/use-cases/qa-release-list';
import { QAReleaseListInput } from '@pharma/core/qa-release/repository/qa-release';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IQAReleaseCreateAdapter implements IUsecase {
  abstract execute(input: QAReleaseCreateInput, trace: ApiTrancingInput): Promise<QAReleaseCreateOutput>;
}

export abstract class IQAReleaseListAdapter implements IUsecase {
  abstract execute(input: QAReleaseListInput): Promise<QAReleaseListOutput>;
}
