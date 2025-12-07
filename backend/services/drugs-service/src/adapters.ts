import { DrugCreateInput, DrugCreateOutput } from '@pharma/core/drug/use-cases/drug-create';
import { DrugDeleteInput, DrugDeleteOutput } from '@pharma/core/drug/use-cases/drug-delete';
import { DrugGetByIdInput, DrugGetByIdOutput } from '@pharma/core/drug/use-cases/drug-get-by-id';
import { DrugListOutput } from '@pharma/core/drug/use-cases/drug-list';
import { DrugUpdateInput, DrugUpdateOutput } from '@pharma/core/drug/use-cases/drug-update';
import { DrugApproveInput, DrugApproveOutput } from '@pharma/core/drug/use-cases/drug-approve';
import { DrugRejectInput, DrugRejectOutput } from '@pharma/core/drug/use-cases/drug-reject';
import { DrugListInput } from '@pharma/core/drug/repository/drug';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IDrugCreateAdapter implements IUsecase {
  abstract execute(input: DrugCreateInput, trace: ApiTrancingInput): Promise<DrugCreateOutput>;
}

export abstract class IDrugUpdateAdapter implements IUsecase {
  abstract execute(input: DrugUpdateInput, trace: ApiTrancingInput): Promise<DrugUpdateOutput>;
}

export abstract class IDrugListAdapter implements IUsecase {
  abstract execute(input: DrugListInput): Promise<DrugListOutput>;
}

export abstract class IDrugGetByIdAdapter implements IUsecase {
  abstract execute(input: DrugGetByIdInput): Promise<DrugGetByIdOutput>;
}

export abstract class IDrugDeleteAdapter implements IUsecase {
  abstract execute(input: DrugDeleteInput, trace: ApiTrancingInput): Promise<DrugDeleteOutput>;
}

export abstract class IDrugApproveAdapter implements IUsecase {
  abstract execute(input: DrugApproveInput, trace: ApiTrancingInput): Promise<DrugApproveOutput>;
}

export abstract class IDrugRejectAdapter implements IUsecase {
  abstract execute(input: DrugRejectInput, trace: ApiTrancingInput): Promise<DrugRejectOutput>;
}
