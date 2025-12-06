import { QCTestCreateInput, QCTestCreateOutput } from '@/core/qc-test/use-cases/qc-test-create';
import { QCTestListOutput } from '@/core/qc-test/use-cases/qc-test-list';
import { QCTestListInput } from '@/core/qc-test/repository/qc-test';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IQCTestCreateAdapter implements IUsecase {
  abstract execute(input: QCTestCreateInput, trace: ApiTrancingInput): Promise<QCTestCreateOutput>;
}

export abstract class IQCTestListAdapter implements IUsecase {
  abstract execute(input: QCTestListInput): Promise<QCTestListOutput>;
}
