import { Repository } from 'typeorm';

import { QCTestEntity } from '@pharma/core/qc-test/entity/qc-test';
import { IQCTestRepository, QCTestListInput } from '@pharma/core/qc-test/repository/qc-test';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';

import { QCTestSchema } from '@pharma/infra/database/postgres/schemas/qc-test';

type Model = QCTestSchema & QCTestEntity;

export class QCTestRepository extends TypeORMRepository<Model> implements IQCTestRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async list(input: QCTestListInput): Promise<{ docs: QCTestEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('test');

    if (input.search?.term) {
      const fields = input.search.fields || ['name', 'description'];
      const conditions = fields.map((field: string) => `test.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.materialType) {
      query.andWhere('test.materialType = :materialType', { materialType: input.materialType });
    }

    query.andWhere('test.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`test.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('test.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as QCTestEntity[],
      limit,
      page,
      total
    };
  }
}
