import { DataSource } from 'typeorm';
import { PurchaseOrder } from '../../../procurement-service/src/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../../../procurement-service/src/entities/purchase-order-item.entity';
import { GoodsReceipt } from '../../../procurement-service/src/entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../../../procurement-service/src/entities/goods-receipt-item.entity';
import { SupplierInvoice } from '../../../procurement-service/src/entities/supplier-invoice.entity';
import { PurchaseOrderStatus, GoodsReceiptStatus, SupplierInvoiceStatus } from '@repo/shared';

export async function seedProcurement(ds: DataSource) {
  const poRepo = ds.getRepository(PurchaseOrder);
  const poItemRepo = ds.getRepository(PurchaseOrderItem);
  const grRepo = ds.getRepository(GoodsReceipt);
  const grItemRepo = ds.getRepository(GoodsReceiptItem);
  const invRepo = ds.getRepository(SupplierInvoice);

  if ((await poRepo.count()) > 0) {
    console.log('  Procurement: already has data, skip.');
    return;
  }

  const po = await poRepo.save({
    poNumber: 'PO-2025-0001',
    supplierId: 1,
    siteId: 1,
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: PurchaseOrderStatus.APPROVED,
    totalAmount: 15000,
  });

  const rawMaterialIds = await ds.query('SELECT id FROM raw_materials ORDER BY id LIMIT 2');
  const rm1 = (rawMaterialIds[0] as any)?.id ?? 1;
  const rm2 = (rawMaterialIds[1] as any)?.id ?? 2;

  const item1 = await poItemRepo.save({
    purchaseOrderId: po.id,
    rawMaterialId: rm1,
    quantity: 100,
    unitPrice: 80,
    totalPrice: 8000,
  });
  const item2 = await poItemRepo.save({
    purchaseOrderId: po.id,
    rawMaterialId: rm2,
    quantity: 50,
    unitPrice: 140,
    totalPrice: 7000,
  });

  const gr = await grRepo.save({
    grnNumber: 'GRN-2025-000001',
    purchaseOrderId: po.id,
    receivedDate: new Date(),
    status: GoodsReceiptStatus.VERIFIED,
    remarks: 'Initial receipt',
  });

  await grItemRepo.save([
    {
      goodsReceiptId: gr.id,
      purchaseOrderItemId: item1.id,
      receivedQuantity: 100,
      acceptedQuantity: 98,
      rejectedQuantity: 2,
      batchNumber: 'BATCH-RM1-001',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      goodsReceiptId: gr.id,
      purchaseOrderItemId: item2.id,
      receivedQuantity: 50,
      acceptedQuantity: 50,
      rejectedQuantity: 0,
      batchNumber: 'BATCH-RM2-001',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  ]);

  await invRepo.save({
    invoiceNumber: 'INV-2025-001',
    supplierId: 1,
    purchaseOrderId: po.id,
    amount: 15000,
    currency: 'USD',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: SupplierInvoiceStatus.SUBMITTED,
    notes: 'Invoice for PO-2025-0001',
  });

  console.log('  Procurement: purchase orders, goods receipts, supplier invoices seeded.');
}
