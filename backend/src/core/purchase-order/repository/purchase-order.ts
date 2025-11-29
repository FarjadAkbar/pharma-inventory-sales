import { IRepository } from '@/infra/repository';

import { PurchaseOrderEntity, PurchaseOrderItemEntity } from '../entity/purchase-order';

export abstract class IPurchaseOrderRepository extends IRepository<PurchaseOrderEntity> {
  abstract findByPONumber(poNumber: string): Promise<PurchaseOrderEntity | null>;
  abstract approve(id: string): Promise<{ id: string; updated: boolean }>;
  abstract cancel(id: string): Promise<{ id: string; updated: boolean }>;
  abstract receive(id: string): Promise<{ id: string; updated: boolean }>;
  abstract list(input: PurchaseOrderListInput): Promise<{ docs: PurchaseOrderEntity[]; limit: number; page: number; total: number }>;
  abstract createWithItems(po: PurchaseOrderEntity, items: PurchaseOrderItemEntity[]): Promise<{ id: string; created: boolean }>;
  abstract getWithItems(id: string): Promise<{ po: PurchaseOrderEntity; items: PurchaseOrderItemEntity[] } | null>;
}

export type PurchaseOrderListInput = {
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
  status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled';
  supplierId?: string;
};
