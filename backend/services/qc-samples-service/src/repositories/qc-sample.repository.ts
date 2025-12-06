import { Repository } from 'typeorm';

import { QCSampleEntity } from '@/core/qc-sample/entity/qc-sample';
import { IQCSampleRepository, QCSampleListInput } from '@/core/qc-sample/repository/qc-sample';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';
import { QCSampleStatusEnum } from '@/core/qc-sample/entity/qc-sample';

import { QCSampleSchema } from '@/infra/database/postgres/schemas/qc-sample';

type Model = QCSampleSchema & QCSampleEntity;

export class QCSampleRepository extends TypeORMRepository<Model> implements IQCSampleRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findBySampleNumber(sampleNumber: string): Promise<QCSampleEntity | null> {
    const sample = await this.repository.findOne({ where: { sampleNumber } });
    return sample ? (sample as QCSampleEntity) : null;
  }

  async assign(id: string, userId: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { assignedTo: userId, status: QCSampleStatusEnum.IN_PROGRESS });
    return { id, updated: true };
  }

  async complete(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: QCSampleStatusEnum.COMPLETED });
    return { id, updated: true };
  }

  async fail(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: QCSampleStatusEnum.FAILED });
    return { id, updated: true };
  }

  async list(input: QCSampleListInput): Promise<{ docs: QCSampleEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('sample');

    if (input.search?.term) {
      const fields = input.search.fields || ['sampleNumber'];
      const conditions = fields.map((field: string) => `sample.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.status) {
      query.andWhere('sample.status = :status', { status: input.status });
    }

    if (input.priority) {
      query.andWhere('sample.priority = :priority', { priority: input.priority });
    }

    if (input.assignedTo) {
      query.andWhere('sample.assignedTo = :assignedTo', { assignedTo: input.assignedTo });
    }

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`sample.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('sample.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as QCSampleEntity[],
      limit,
      page,
      total
    };
  }
}
