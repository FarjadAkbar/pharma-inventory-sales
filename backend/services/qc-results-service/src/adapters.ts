import { QCResultCreateInput, QCResultCreateOutput } from '@pharma/core/qc-result/use-cases/qc-result-create';
import { QCResultListOutput } from '@pharma/core/qc-result/use-cases/qc-result-list';
import { QCResultListInput } from '@pharma/core/qc-result/repository/qc-result';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IQCResultCreateAdapter implements IUsecase {
  abstract execute(input: QCResultCreateInput, trace: ApiTrancingInput): Promise<QCResultCreateOutput>;
}

export abstract class IQCResultListAdapter implements IUsecase {
  abstract execute(input: QCResultListInput): Promise<QCResultListOutput>;
}
