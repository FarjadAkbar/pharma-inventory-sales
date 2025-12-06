import { QAReleaseCreateInput, QAReleaseCreateOutput } from '@/core/qa-release/use-cases/qa-release-create';
import { QAReleaseListOutput } from '@/core/qa-release/use-cases/qa-release-list';
import { QAReleaseListInput } from '@/core/qa-release/repository/qa-release';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IQAReleaseCreateAdapter implements IUsecase {
  abstract execute(input: QAReleaseCreateInput, trace: ApiTrancingInput): Promise<QAReleaseCreateOutput>;
}

export abstract class IQAReleaseListAdapter implements IUsecase {
  abstract execute(input: QAReleaseListInput): Promise<QAReleaseListOutput>;
}
