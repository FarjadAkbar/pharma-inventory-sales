import { Repository, DataSource } from 'typeorm';

import { PurchaseOrderEntity, PurchaseOrderItemEntity } from '@pharma/core/purchase-order/entity/purchase-order';
import { IPurchaseOrderRepository, PurchaseOrderListInput } from '@pharma/core/purchase-order/repository/purchase-order';
import { TypeORMRepository } from '@pharma/infra/repository/postgres/repository';
import { PurchaseOrderStatusEnum } from '@pharma/core/purchase-order/entity/purchase-order';

import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@pharma/infra/database/postgres/schemas/purchase-order';

type Model = PurchaseOrderSchema & PurchaseOrderEntity;

export class PurchaseOrderRepository extends TypeORMRepository<Model> implements IPurchaseOrderRepository {
  constructor(
    readonly repository: Repository<Model>,
    private readonly dataSource: DataSource,
    private readonly itemRepository: Repository<PurchaseOrderItemSchema>
  ) {
    super(repository);
  }

  async findByPONumber(poNumber: string): Promise<PurchaseOrderEntity | null> {
    const po = await this.repository.findOne({ where: { poNumber } });
    return po ? (po as PurchaseOrderEntity) : null;
  }

  async approve(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: PurchaseOrderStatusEnum.APPROVED });
    return { id, updated: true };
  }

  async cancel(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: PurchaseOrderStatusEnum.CANCELLED });
    return { id, updated: true };
  }

  async receive(id: string): Promise<{ id: string; updated: boolean }> {
    await this.repository.update({ id }, { status: PurchaseOrderStatusEnum.RECEIVED });
    return { id, updated: true };
  }

  async list(input: PurchaseOrderListInput): Promise<{ docs: PurchaseOrderEntity[]; limit: number; page: number; total: number }> {
    const query = this.repository.createQueryBuilder('po');

    if (input.search?.term) {
      const fields = input.search.fields || ['poNumber'];
      const conditions = fields.map((field: string) => `po.${field} ILIKE :term`).join(' OR ');
      query.andWhere(`(${conditions})`, { term: `%${input.search.term}%` });
    }

    if (input.status) {
      query.andWhere('po.status = :status', { status: input.status });
    }

    if (input.supplierId) {
      query.andWhere('po.supplierId = :supplierId', { supplierId: input.supplierId });
    }

    query.andWhere('po.deletedAt IS NULL');

    const total = await query.getCount();

    if (input.sort) {
      query.orderBy(`po.${input.sort.field}`, input.sort.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('po.createdAt', 'DESC');
    }

    const limit = input.limit || 10;
    const page = input.page || 1;
    query.skip((page - 1) * limit).take(limit);

    const docs = await query.getMany();

    return {
      docs: docs as unknown as PurchaseOrderEntity[],
      limit,
      page,
      total
    };
  }

  async createWithItems(po: PurchaseOrderEntity, items: PurchaseOrderItemEntity[]): Promise<{ id: string; created: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(PurchaseOrderSchema, po as unknown as PurchaseOrderSchema);
      await queryRunner.manager.save(PurchaseOrderItemSchema, items as unknown as PurchaseOrderItemSchema[]);

      await queryRunner.commitTransaction();

      return { id: po.id!, created: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWithItems(id: string): Promise<{ po: PurchaseOrderEntity; items: PurchaseOrderItemEntity[] } | null> {
    const po = await this.repository.findOne({ where: { id } });
    if (!po) {
      return null;
    }

    const items = await this.itemRepository.find({ where: { purchaseOrderId: id } });

    return {
      po: po as unknown as PurchaseOrderEntity,
      items: items as unknown as PurchaseOrderItemEntity[]
    };
  }
}
