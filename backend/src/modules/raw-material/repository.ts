import { Repository } from 'typeorm';

import { RawMaterialEntity } from '@/core/raw-material/entity/raw-material';
import { IRawMaterialRepository, RawMaterialListInput } from '@/core/raw-material/repository/raw-material';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';

import { RawMaterialSchema } from '../../infra/database/postgres/schemas/raw-material';

type Model = RawMaterialSchema & RawMaterialEntity;

export class RawMaterialRepository
  extends TypeORMRepository<Model>
  implements IRawMaterialRepository
{
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async findByCode(code: string): Promise<RawMaterialEntity | null> {
    const rawMaterial = await this.repository.findOne({ where: { code } });
    return rawMaterial ? (rawMaterial as RawMaterialEntity) : null;
  }

  async findBySupplierId(supplierId: string): Promise<RawMaterialEntity[]> {
    const rawMaterials = await this.repository.find({ where: { supplierId } });
    return rawMaterials as RawMaterialEntity[];
  }

  async list(input: RawMaterialListInput): Promise<{ docs: RawMaterialEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('rawMaterial');

    if (input.search?.term) {
      const fields = input.search.fields || ['name', 'code', 'grade'];
      const conditions = fields.map((field: string) => `rawMaterial.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.supplierId) {
      query.andWhere('rawMaterial.supplierId = :supplierId', { supplierId: input.supplierId });
    }

    query.andWhere('rawMaterial.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`rawMaterial.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('rawMaterial.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as RawMaterialEntity[],
      limit,
      page,
      total
    };
  }
}
