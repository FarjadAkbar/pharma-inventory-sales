import { Repository, DataSource } from 'typeorm';

import { GoodsReceiptEntity, GoodsReceiptItemEntity } from '@pharma/core/goods-receipt/entity/goods-receipt';
import { IGoodsReceiptRepository, GoodsReceiptListInput } from '@pharma/core/goods-receipt/repository/goods-receipt';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';
import { GoodsReceiptStatusEnum } from '@pharma/core/goods-receipt/entity/goods-receipt';

import { GoodsReceiptSchema, GoodsReceiptItemSchema } from '@pharma/infra/database/postgres/schemas/goods-receipt';

type Model = GoodsReceiptSchema & GoodsReceiptEntity;

export class GoodsReceiptRepository extends TypeORMRepository<Model> implements IGoodsReceiptRepository {
  constructor(
    readonly repository: Repository<Model>,
    private readonly dataSource: DataSource,
    private readonly itemRepository: Repository<GoodsReceiptItemSchema>
  ) {
    super(repository);
  }

  async findByGRNNumber(grnNumber: string): Promise<GoodsReceiptEntity | null> {
    const grn = await this.repository.findOne({ where: { grnNumber } });
    return grn ? (grn as GoodsReceiptEntity) : null;
  }

  async verify(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: GoodsReceiptStatusEnum.VERIFIED });
    return { id, updated: true };
  }

  async complete(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: GoodsReceiptStatusEnum.COMPLETED });
    return { id, updated: true };
  }

  async list(input: GoodsReceiptListInput): Promise<{ docs: GoodsReceiptEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('grn');

    if (input.search?.term) {
      const fields = input.search.fields || ['grnNumber'];
      const conditions = fields.map((field: string) => `grn.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.status) {
      query.andWhere('grn.status = :status', { status: input.status });
    }

    if (input.purchaseOrderId) {
      query.andWhere('grn.purchaseOrderId = :purchaseOrderId', { purchaseOrderId: input.purchaseOrderId });
    }

    query.andWhere('grn.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`grn.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('grn.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as unknown as GoodsReceiptEntity[],
      limit,
      page,
      total
    };
  }

  async createWithItems(grn: GoodsReceiptEntity, items: GoodsReceiptItemEntity[]): Promise<{ id: string; created: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(GoodsReceiptSchema, grn as unknown as GoodsReceiptSchema);
      await queryRunner.manager.save(GoodsReceiptItemSchema, items as unknown as GoodsReceiptItemSchema[]);

      await queryRunner.commitTransaction();

      return { id: grn.id!, created: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWithItems(id: string): Promise<{ grn: GoodsReceiptEntity; items: GoodsReceiptItemEntity[] } | null> {
    const grn = await this.repository.findOne({ where: { id } });
    if (!grn) {
      return null;
    }

    const items = await this.itemRepository.find({ where: { goodsReceiptId: id } });

    return {
      grn: grn as unknown as GoodsReceiptEntity,
      items: items as unknown as GoodsReceiptItemEntity[]
    };
  }
}
