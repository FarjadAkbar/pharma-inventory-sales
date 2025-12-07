import { PermissionEntity } from '../entity/permission';
import { ValidateSchema } from '@pharma/utils/decorators';
import { PaginationInput, PaginationOutput, PaginationSchema } from '@pharma/utils/pagination';
import { SearchSchema } from '@pharma/utils/search';
import { SortSchema } from '@pharma/utils/sort';
import { IUsecase } from '@pharma/utils/usecase';
import { InputValidator } from '@pharma/utils/validator';

import { IPermissionRepository } from '../repository/permission';

export const PermissionListSchema = InputValidator.intersection(PaginationSchema, SortSchema.merge(SearchSchema));

export class PermissionListUsecase implements IUsecase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @ValidateSchema(PermissionListSchema)
  async execute(input: PermissionListInput): Promise<PermissionListOutput> {
    return await this.permissionRepository.paginate(input);
  }
}

export type PermissionListInput = PaginationInput<PermissionEntity>;
export type PermissionListOutput = PaginationOutput<PermissionEntity>;
