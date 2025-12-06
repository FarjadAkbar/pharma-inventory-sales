import { SupplierCreateInput, SupplierCreateOutput } from '@/core/supplier/use-cases/supplier-create';
import { SupplierDeleteInput, SupplierDeleteOutput } from '@/core/supplier/use-cases/supplier-delete';
import { SupplierGetByIdInput, SupplierGetByIdOutput } from '@/core/supplier/use-cases/supplier-get-by-id';
import { SupplierListOutput } from '@/core/supplier/use-cases/supplier-list';
import {
  SupplierUpdateRatingInput,
  SupplierUpdateRatingOutput
} from '@/core/supplier/use-cases/supplier-update-rating';
import { SupplierUpdateInput, SupplierUpdateOutput } from '@/core/supplier/use-cases/supplier-update';
import { SupplierListInput } from '@/core/supplier/repository/supplier';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class ISupplierCreateAdapter implements IUsecase {
  abstract execute(input: SupplierCreateInput, trace: ApiTrancingInput): Promise<SupplierCreateOutput>;
}

export abstract class ISupplierUpdateAdapter implements IUsecase {
  abstract execute(input: SupplierUpdateInput, trace: ApiTrancingInput): Promise<SupplierUpdateOutput>;
}

export abstract class ISupplierListAdapter implements IUsecase {
  abstract execute(input: SupplierListInput): Promise<SupplierListOutput>;
}

export abstract class ISupplierGetByIdAdapter implements IUsecase {
  abstract execute(input: SupplierGetByIdInput): Promise<SupplierGetByIdOutput>;
}

export abstract class ISupplierDeleteAdapter implements IUsecase {
  abstract execute(input: SupplierDeleteInput, trace: ApiTrancingInput): Promise<SupplierDeleteOutput>;
}

export abstract class ISupplierUpdateRatingAdapter implements IUsecase {
  abstract execute(input: SupplierUpdateRatingInput): Promise<SupplierUpdateRatingOutput>;
}
