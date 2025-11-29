import { Repository } from 'typeorm';

import { QCResultEntity } from '@/core/qc-result/entity/qc-result';
import { IQCResultRepository, QCResultListInput } from '@/core/qc-result/repository/qc-result';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';

import { QCResultSchema } from '../../infra/database/postgres/schemas/qc-result';

type Model = QCResultSchema & QCResultEntity;

export class QCResultRepository extends TypeORMRepository<Model> implements IQCResultRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findBySampleId(sampleId: string): Promise<QCResultEntity[]> {
    const results = await this.repository.find({ where: { sampleId } });
    return results as QCResultEntity[];
  }

  async list(input: QCResultListInput): Promise<{ docs: QCResultEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('result');

    if (input.sampleId) {
      query.andWhere('result.sampleId = :sampleId', { sampleId: input.sampleId });
    }

    if (input.testId) {
      query.andWhere('result.testId = :testId', { testId: input.testId });
    }

    if (input.passed !== undefined) {
      query.andWhere('result.passed = :passed', { passed: input.passed });
    }

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`result.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('result.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as QCResultEntity[],
      limit,
      page,
      total
    };
  }
}
