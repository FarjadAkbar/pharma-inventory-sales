import { RoleEntity } from '@/core/role/entity/role';
import { ValidateSchema } from '@pharma/utils/decorators';
import { PaginationInput, PaginationOutput, PaginationSchema } from '@pharma/utils/pagination';
import { SearchSchema } from '@pharma/utils/search';
import { SortSchema } from '@pharma/utils/sort';
import { IUsecase } from '@pharma/utils/usecase';
import { InputValidator } from '@pharma/utils/validator';

import { IRoleRepository } from '../repository/role';

export const RoleListSchema = InputValidator.intersection(PaginationSchema, SortSchema.merge(SearchSchema));

export class RoleListUsecase implements IUsecase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @ValidateSchema(RoleListSchema)
  async execute(input: RoleListInput): Promise<RoleListOutput> {
    return await this.roleRepository.paginate(input);
  }
}

export type RoleListInput = PaginationInput<RoleEntity>;
export type RoleListOutput = PaginationOutput<RoleEntity>;
