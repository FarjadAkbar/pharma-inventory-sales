import { Repository } from 'typeorm';

import { DrugEntity } from '@/core/drug/entity/drug';
import { IDrugRepository, DrugListInput } from '@/core/drug/repository/drug';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';
import { DrugApprovalStatusEnum } from '@/core/drug/entity/drug';

import { DrugSchema } from '@/infra/database/postgres/schemas/drug';

type Model = DrugSchema & DrugEntity;

export class DrugRepository extends TypeORMRepository<Model> implements IDrugRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByCode(code: string): Promise<DrugEntity | null> {
    const drug = await this.repository.findOne({ where: { code } });
    return drug ? (drug as DrugEntity) : null;
  }

  async approve(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { approvalStatus: DrugApprovalStatusEnum.APPROVED });
    return { id, updated: true };
  }

  async reject(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { approvalStatus: DrugApprovalStatusEnum.REJECTED });
    return { id, updated: true };
  }

  async list(input: DrugListInput): Promise<{ docs: DrugEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('drug');

    if (input.search?.term) {
      const fields = input.search.fields || ['name', 'code', 'formula'];
      const conditions = fields.map((field: string) => `drug.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.approvalStatus) {
      query.andWhere('drug.approvalStatus = :approvalStatus', { approvalStatus: input.approvalStatus });
    }

    query.andWhere('drug.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`drug.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('drug.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as DrugEntity[],
      limit,
      page,
      total
    };
  }
}
