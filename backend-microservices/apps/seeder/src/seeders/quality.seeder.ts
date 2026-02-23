import { DataSource } from 'typeorm';
import { QCTest } from '../../../quality-service/src/entities/qc-test.entity';
import { QCSample } from '../../../quality-service/src/entities/qc-sample.entity';
import { GoodsReceipt } from '../../../procurement-service/src/entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../../../procurement-service/src/entities/goods-receipt-item.entity';
import { RawMaterial } from '../../../master-data-service/src/entities/raw-material.entity';
import { QCTestStatus, QCSampleStatus, QCSamplePriority, QCSampleSourceType } from '@repo/shared';

export async function seedQuality(ds: DataSource) {
  const testRepo = ds.getRepository(QCTest);
  const sampleRepo = ds.getRepository(QCSample);
  const grRepo = ds.getRepository(GoodsReceipt);
  const grItemRepo = ds.getRepository(GoodsReceiptItem);
  const rmRepo = ds.getRepository(RawMaterial);

  if ((await testRepo.count()) > 0) {
    console.log('  Quality: already has data, skip.');
    return;
  }

  await testRepo.save([
    { name: 'Appearance', code: 'QC-APP-01', description: 'Visual inspection', category: 'Physical', status: QCTestStatus.ACTIVE as any },
    { name: 'pH', code: 'QC-PH-01', description: 'pH measurement', category: 'Chemical', status: QCTestStatus.ACTIVE as any },
    { name: 'Assay', code: 'QC-ASSAY-01', description: 'Content assay', category: 'Chemical', status: QCTestStatus.ACTIVE as any },
    { name: 'Dissolution', code: 'QC-DIS-01', description: 'Dissolution test', category: 'Performance', status: QCTestStatus.ACTIVE as any },
  ]);

  const grList = await grRepo.find({ take: 1, order: { id: 'ASC' } });
  const gr = grList[0];
  if (gr) {
    const items = await grItemRepo.find({ where: { goodsReceiptId: gr.id }, take: 1 });
    const rmList = await rmRepo.find({ take: 1 });
    if (items[0] && rmList[0]) {
      await sampleRepo.save({
        sampleCode: 'QC-SAM-2025-000001',
        sourceType: QCSampleSourceType.GOODS_RECEIPT,
        sourceId: gr.id,
        sourceReference: gr.grnNumber,
        goodsReceiptItemId: items[0].id,
        materialId: rmList[0].id,
        materialName: rmList[0].name,
        materialCode: rmList[0].code,
        batchNumber: 'BATCH-SEED-001',
        quantity: 10,
        unit: 'kg',
        priority: QCSamplePriority.NORMAL,
        status: QCSampleStatus.PENDING,
        requestedBy: 1,
        requestedAt: new Date(),
      });
    }
  }

  console.log('  Quality: QC tests (and sample if GR exists) seeded.');
}
