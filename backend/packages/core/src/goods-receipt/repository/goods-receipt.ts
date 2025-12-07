import { IRepository } from '@/infra/repository';

import { GoodsReceiptEntity, GoodsReceiptItemEntity } from '../entity/goods-receipt';

export abstract class IGoodsReceiptRepository extends IRepository<GoodsReceiptEntity> {
  abstract findByGRNNumber(grnNumber: string): Promise<GoodsReceiptEntity | null>;
  abstract verify(id: string): Promise<{ id: string; updated: boolean }>;
  abstract complete(id: string): Promise<{ id: string; updated: boolean }>;
  abstract list(input: GoodsReceiptListInput): Promise<{ docs: GoodsReceiptEntity[]; limit: number; page: number; total: number }>;
  abstract createWithItems(grn: GoodsReceiptEntity, items: GoodsReceiptItemEntity[]): Promise<{ id: string; created: boolean }>;
  abstract getWithItems(id: string): Promise<{ grn: GoodsReceiptEntity; items: GoodsReceiptItemEntity[] } | null>;
}

export type GoodsReceiptListInput = {
  limit?: number;
  page?: number;
  search?: {
    term?: string;
    fields?: string[];
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  status?: 'Draft' | 'Verified' | 'Completed';
  purchaseOrderId?: string;
};
