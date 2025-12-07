import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const PONumber = InputValidator.string().min(1).max(50);
const SupplierId = InputValidator.string().uuid();
const SiteId = InputValidator.string().uuid().optional();
const ExpectedDate = InputValidator.date();
const Status = InputValidator.enum(['Draft', 'Pending', 'Approved', 'Received', 'Cancelled']);
const TotalAmount = InputValidator.number().min(0);
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const PurchaseOrderEntitySchema = InputValidator.object({
  id: ID,
  poNumber: PONumber,
  supplierId: SupplierId,
  siteId: SiteId,
  expectedDate: ExpectedDate,
  status: Status,
  totalAmount: TotalAmount,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type PurchaseOrder = Infer<typeof PurchaseOrderEntitySchema>;

export class PurchaseOrderEntity extends BaseEntity<PurchaseOrderEntity>() {
  poNumber!: string;
  supplierId!: string;
  siteId?: string;
  expectedDate!: Date;
  status!: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled';
  totalAmount!: number;

  constructor(entity: PurchaseOrder) {
    super(PurchaseOrderEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}

export enum PurchaseOrderStatusEnum {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled'
}

// PO Item Entity
const ItemID = InputValidator.string().uuid();
const PurchaseOrderId = InputValidator.string().uuid();
const MaterialId = InputValidator.string().uuid();
const Quantity = InputValidator.number().min(0);
const UnitPrice = InputValidator.number().min(0);
const TotalPrice = InputValidator.number().min(0);

export const PurchaseOrderItemEntitySchema = InputValidator.object({
  id: ItemID,
  purchaseOrderId: PurchaseOrderId,
  materialId: MaterialId,
  quantity: Quantity,
  unitPrice: UnitPrice,
  totalPrice: TotalPrice,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type PurchaseOrderItem = Infer<typeof PurchaseOrderItemEntitySchema>;

export class PurchaseOrderItemEntity extends BaseEntity<PurchaseOrderItemEntity>() {
  purchaseOrderId!: string;
  materialId!: string;
  quantity!: number;
  unitPrice!: number;
  totalPrice!: number;

  constructor(entity: PurchaseOrderItem) {
    super(PurchaseOrderItemEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
