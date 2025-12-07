import { Repository } from 'typeorm';

import { DeviationEntity } from '@pharma/core/deviation/entity/deviation';
import { IDeviationRepository, DeviationListInput } from '@pharma/core/deviation/repository/deviation';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';
import { DeviationStatusEnum } from '@pharma/core/deviation/entity/deviation';

import { DeviationSchema } from '@pharma/infra/database/postgres/schemas/deviation';

type Model = DeviationSchema & DeviationEntity;

export class DeviationRepository extends TypeORMRepository<Model> implements IDeviationRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByDeviationNumber(deviationNumber: string): Promise<DeviationEntity | null> {
    const deviation = await this.repository.findOne({ where: { deviationNumber } });
    return deviation ? (deviation as DeviationEntity) : null;
  }

  async close(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: DeviationStatusEnum.CLOSED });
    return { id, updated: true };
  }

  async list(input: DeviationListInput): Promise<{ docs: DeviationEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('deviation');

    if (input.search?.term) {
      const fields = input.search.fields || ['deviationNumber', 'title'];
      const conditions = fields.map((field: string) => `deviation.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.severity) {
      query.andWhere('deviation.severity = :severity', { severity: input.severity });
    }

    if (input.status) {
      query.andWhere('deviation.status = :status', { status: input.status });
    }

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`deviation.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('deviation.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as DeviationEntity[],
      limit,
      page,
      total
    };
  }
}
