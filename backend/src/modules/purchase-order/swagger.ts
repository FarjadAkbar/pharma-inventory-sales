import { ApiProperty } from '@nestjs/swagger';

export class POItemRequest {
  @ApiProperty({ example: 'uuid' })
  materialId!: string;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ example: 50.00 })
  unitPrice!: number;

  @ApiProperty({ example: 5000.00 })
  totalPrice!: number;
}

export class CreatePurchaseOrderRequest {
  @ApiProperty({ example: 'PO-2024-001' })
  poNumber!: string;

  @ApiProperty({ example: 'uuid' })
  supplierId!: string;

  @ApiProperty({ example: 'uuid', required: false })
  siteId?: string;

  @ApiProperty({ example: '2024-12-31' })
  expectedDate!: Date;

  @ApiProperty({ type: [POItemRequest] })
  items!: POItemRequest[];

  @ApiProperty({ example: 'Draft', enum: ['Draft', 'Pending', 'Approved', 'Received', 'Cancelled'], required: false })
  status?: string;
}

export class PurchaseOrderResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'PO-2024-001' })
  poNumber!: string;

  @ApiProperty({ example: 'uuid' })
  supplierId!: string;

  @ApiProperty({ example: 'uuid' })
  siteId?: string;

  @ApiProperty()
  expectedDate!: Date;

  @ApiProperty({ example: 'Draft' })
  status!: string;

  @ApiProperty({ example: 10000.00 })
  totalAmount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class POItemResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  purchaseOrderId!: string;

  @ApiProperty({ example: 'uuid' })
  materialId!: string;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ example: 50.00 })
  unitPrice!: number;

  @ApiProperty({ example: 5000.00 })
  totalPrice!: number;
}

export class PurchaseOrderWithItemsResponse {
  @ApiProperty({ type: PurchaseOrderResponse })
  po!: PurchaseOrderResponse;

  @ApiProperty({ type: [POItemResponse] })
  items!: POItemResponse[];
}

export class PurchaseOrderListResponse {
  @ApiProperty({ type: [PurchaseOrderResponse] })
  docs!: PurchaseOrderResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
