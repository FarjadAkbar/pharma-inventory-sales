import { QCSampleCreateInput, QCSampleCreateOutput } from '@/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListOutput } from '@/core/qc-sample/use-cases/qc-sample-list';
import { QCSampleAssignInput, QCSampleAssignOutput } from '@/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteInput, QCSampleCompleteOutput } from '@/core/qc-sample/use-cases/qc-sample-complete';
import { QCSampleListInput } from '@/core/qc-sample/repository/qc-sample';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

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
