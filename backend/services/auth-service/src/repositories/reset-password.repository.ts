import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';

import { ResetPasswordEntity } from '@pharma/core/reset-password/entity/reset-password';
import { IResetPasswordRepository } from '@pharma/core/reset-password/repository/reset-password';
import { ResetPasswordSchema } from '@pharma/infra/database/postgres/schemas/reset-password';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';
import { DateUtils } from '@pharma/utils/date';

type Model = ResetPasswordSchema & ResetPasswordEntity;
@Injectable()
export class ResetPasswordRepository extends TypeORMRepository<Model> implements IResetPasswordRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByIdUserId(id: string): Promise<ResetPasswordEntity> {
    const date = DateUtils.getDate().minus(1800000).toJSDate();
    const result = await this.repository.findOne({
      where: { user: { id }, createdAt: MoreThan(date) } as FindOptionsWhere<unknown>
    });
    return result as unknown as ResetPasswordEntity;
  }
}

