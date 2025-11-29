import { Repository } from 'typeorm';

import { QAReleaseEntity } from '@/core/qa-release/entity/qa-release';
import { IQAReleaseRepository, QAReleaseListInput } from '@/core/qa-release/repository/qa-release';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';

import { QAReleaseSchema } from '../../infra/database/postgres/schemas/qa-release';

type Model = QAReleaseSchema & QAReleaseEntity;

export class QAReleaseRepository extends TypeORMRepository<Model> implements IQAReleaseRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByEntityId(entityId: string): Promise<QAReleaseEntity | null> {
    const release = await this.repository.findOne({ where: { entityId } });
    return release ? (release as QAReleaseEntity) : null;
  }

  async list(input: QAReleaseListInput): Promise<{ docs: QAReleaseEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('release');

    if (input.decision) {
      query.andWhere('release.decision = :decision', { decision: input.decision });
    }

    if (input.entityType) {
      query.andWhere('release.entityType = :entityType', { entityType: input.entityType });
    }

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`release.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('release.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as QAReleaseEntity[],
      limit,
      page,
      total
    };
  }
}
