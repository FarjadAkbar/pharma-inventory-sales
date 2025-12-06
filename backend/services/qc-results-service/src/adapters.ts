import { QCResultCreateInput, QCResultCreateOutput } from '@/core/qc-result/use-cases/qc-result-create';
import { QCResultListOutput } from '@/core/qc-result/use-cases/qc-result-list';
import { QCResultListInput } from '@/core/qc-result/repository/qc-result';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IQCResultCreateAdapter implements IUsecase {
  abstract execute(input: QCResultCreateInput, trace: ApiTrancingInput): Promise<QCResultCreateOutput>;
}

export abstract class IQCResultListAdapter implements IUsecase {
  abstract execute(input: QCResultListInput): Promise<QCResultListOutput>;
}
