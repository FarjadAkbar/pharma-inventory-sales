import { Injectable } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { RoleEntity } from '@pharma/core/role/entity/role';
import { IRoleRepository } from '@pharma/core/role/repository/role';
import { RoleListInput, RoleListOutput } from '@pharma/core/role/use-cases/role-list';
import { RoleSchema } from '@pharma/infra/database/postgres/schemas/role';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';
import { ConvertTypeOrmFilter, SearchTypeEnum, ValidateDatabaseSortAllowed } from '@pharma/utils/decorators';
import { IEntity } from '@pharma/utils/entity';
import { PaginationUtils } from '@pharma/utils/pagination';

@Injectable()
export class RoleRepository extends TypeORMRepository<Model> implements IRoleRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  @ConvertTypeOrmFilter<RoleEntity>([{ name: 'name', type: SearchTypeEnum.like }])
  @ValidateDatabaseSortAllowed<RoleEntity>({ name: 'name' }, { name: 'createdAt' })
  async paginate(input: RoleListInput): Promise<RoleListOutput> {
    const skip = PaginationUtils.calculateSkip(input);

    const [docs, total] = await this.repository.findAndCount({
      take: input.limit,
      skip,
      order: input.sort as FindOptionsOrder<IEntity>,
      where: input.search as FindOptionsWhere<unknown>
    });

    return { docs, total, page: input.page, limit: input.limit };
  }
}

type Model = RoleSchema & RoleEntity;
