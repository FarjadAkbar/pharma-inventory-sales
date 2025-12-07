import { RawMaterialCreateInput, RawMaterialCreateOutput } from '@pharma/core/raw-material/use-cases/raw-material-create';
import { RawMaterialDeleteInput, RawMaterialDeleteOutput } from '@pharma/core/raw-material/use-cases/raw-material-delete';
import { RawMaterialGetByIdInput, RawMaterialGetByIdOutput } from '@pharma/core/raw-material/use-cases/raw-material-get-by-id';
import { RawMaterialListOutput } from '@pharma/core/raw-material/use-cases/raw-material-list';
import { RawMaterialUpdateInput, RawMaterialUpdateOutput } from '@pharma/core/raw-material/use-cases/raw-material-update';
import { RawMaterialListInput } from '@pharma/core/raw-material/repository/raw-material';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class IRawMaterialCreateAdapter implements IUsecase {
  abstract execute(input: RawMaterialCreateInput, trace: ApiTrancingInput): Promise<RawMaterialCreateOutput>;
}

export abstract class IRawMaterialUpdateAdapter implements IUsecase {
  abstract execute(input: RawMaterialUpdateInput, trace: ApiTrancingInput): Promise<RawMaterialUpdateOutput>;
}

export abstract class IRawMaterialListAdapter implements IUsecase {
  abstract execute(input: RawMaterialListInput): Promise<RawMaterialListOutput>;
}

export abstract class IRawMaterialGetByIdAdapter implements IUsecase {
  abstract execute(input: RawMaterialGetByIdInput): Promise<RawMaterialGetByIdOutput>;
}

export abstract class IRawMaterialDeleteAdapter implements IUsecase {
  abstract execute(input: RawMaterialDeleteInput, trace: ApiTrancingInput): Promise<RawMaterialDeleteOutput>;
}
