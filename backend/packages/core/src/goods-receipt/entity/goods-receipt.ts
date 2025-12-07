import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const GRNNumber = InputValidator.string().min(1).max(50);
const PurchaseOrderId = InputValidator.string().uuid();
const ReceivedDate = InputValidator.date();
const Status = InputValidator.enum(['Draft', 'Verified', 'Completed']);
const Remarks = InputValidator.string().optional();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const GoodsReceiptEntitySchema = InputValidator.object({
  id: ID,
  grnNumber: GRNNumber,
  purchaseOrderId: PurchaseOrderId,
  receivedDate: ReceivedDate,
  status: Status,
  remarks: Remarks,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type GoodsReceipt = Infer<typeof GoodsReceiptEntitySchema>;

export class GoodsReceiptEntity extends BaseEntity<GoodsReceiptEntity>() {
  grnNumber!: string;
  purchaseOrderId!: string;
  receivedDate!: Date;
  status!: 'Draft' | 'Verified' | 'Completed';
  remarks?: string;

  constructor(entity: GoodsReceipt) {
    super(GoodsReceiptEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum GoodsReceiptStatusEnum {
  DRAFT = 'Draft',
  VERIFIED = 'Verified',
  COMPLETED = 'Completed'
}

// GRN Item Entity
const ItemID = InputValidator.string().uuid();
const GoodsReceiptId = InputValidator.string().uuid();
const PurchaseOrderItemId = InputValidator.string().uuid();
const ReceivedQuantity = InputValidator.number().min(0);
const AcceptedQuantity = InputValidator.number().min(0);
const RejectedQuantity = InputValidator.number().min(0);
const BatchNumber = InputValidator.string().optional();
const ExpiryDate = InputValidator.date().optional();

export const GoodsReceiptItemEntitySchema = InputValidator.object({
  id: ItemID,
  goodsReceiptId: GoodsReceiptId,
  purchaseOrderItemId: PurchaseOrderItemId,
  receivedQuantity: ReceivedQuantity,
  acceptedQuantity: AcceptedQuantity,
  rejectedQuantity: RejectedQuantity,
  batchNumber: BatchNumber,
  expiryDate: ExpiryDate,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type GoodsReceiptItem = Infer<typeof GoodsReceiptItemEntitySchema>;

export class GoodsReceiptItemEntity extends BaseEntity<GoodsReceiptItemEntity>() {
  goodsReceiptId!: string;
  purchaseOrderItemId!: string;
  receivedQuantity!: number;
  acceptedQuantity!: number;
  rejectedQuantity!: number;
  batchNumber?: string;
  expiryDate?: Date;

  constructor(entity: GoodsReceiptItem) {
    super(GoodsReceiptItemEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
