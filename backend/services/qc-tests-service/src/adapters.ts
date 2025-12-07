import { QCTestCreateInput, QCTestCreateOutput } from '@pharma/core/qc-test/use-cases/qc-test-create';
import { QCTestListOutput } from '@pharma/core/qc-test/use-cases/qc-test-list';
import { QCTestListInput } from '@pharma/core/qc-test/repository/qc-test';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IQCTestCreateAdapter implements IUsecase {
  abstract execute(input: QCTestCreateInput, trace: ApiTrancingInput): Promise<QCTestCreateOutput>;
}

export abstract class IQCTestListAdapter implements IUsecase {
  abstract execute(input: QCTestListInput): Promise<QCTestListOutput>;
}
