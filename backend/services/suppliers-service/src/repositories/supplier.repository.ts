import { Repository } from 'typeorm';

import { SupplierEntity } from '@pharma/core/supplier/entity/supplier';
import { ISupplierRepository, SupplierListInput } from '@pharma/core/supplier/repository/supplier';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';

import { SupplierSchema } from '@pharma/infra/database/postgres/schemas/supplier';

type Model = SupplierSchema & SupplierEntity;

export class SupplierRepository extends TypeORMRepository<Model> implements ISupplierRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<SupplierEntity | null> {
    const supplier = await this.repository.findOne({ where: { email } });
    return supplier ? (supplier as SupplierEntity) : null;
  }

  async updateRating(id: string, rating: number): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { rating });
    return { id, updated: true };
  }

  async list(input: SupplierListInput): Promise<{ docs: SupplierEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('supplier');

    if (input.search?.term) {
      const fields = input.search.fields || ['name', 'email', 'contactPerson'];
      const conditions = fields.map((field: string) => `supplier.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.status) {
      query.andWhere('supplier.status = :status', { status: input.status });
    }

    query.andWhere('supplier.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`supplier.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('supplier.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as SupplierEntity[],
      limit,
      page,
      total
    };
  }
}
