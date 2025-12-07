import { QCSampleCreateInput, QCSampleCreateOutput } from '@pharma/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListOutput } from '@pharma/core/qc-sample/use-cases/qc-sample-list';
import { QCSampleAssignInput, QCSampleAssignOutput } from '@pharma/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteInput, QCSampleCompleteOutput } from '@pharma/core/qc-sample/use-cases/qc-sample-complete';
import { QCSampleListInput } from '@pharma/core/qc-sample/repository/qc-sample';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IQCSampleCreateAdapter implements IUsecase {
  abstract execute(input: QCSampleCreateInput, trace: ApiTrancingInput): Promise<QCSampleCreateOutput>;
}

export abstract class IQCSampleListAdapter implements IUsecase {
  abstract execute(input: QCSampleListInput): Promise<QCSampleListOutput>;
}

export abstract class IQCSampleAssignAdapter implements IUsecase {
  abstract execute(input: QCSampleAssignInput, trace: ApiTrancingInput): Promise<QCSampleAssignOutput>;
}

export abstract class IQCSampleCompleteAdapter implements IUsecase {
  abstract execute(input: QCSampleCompleteInput, trace: ApiTrancingInput): Promise<QCSampleCompleteOutput>;
}
