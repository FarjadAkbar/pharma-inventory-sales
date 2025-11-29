import { ApiProperty } from '@nestjs/swagger';

export class GRNItemRequest {
  @ApiProperty({ example: 'uuid' })
  purchaseOrderItemId!: string;

  @ApiProperty({ example: 100 })
  receivedQuantity!: number;

  @ApiProperty({ example: 95 })
  acceptedQuantity!: number;

  @ApiProperty({ example: 5 })
  rejectedQuantity!: number;

  @ApiProperty({ example: 'BATCH-001', required: false })
  batchNumber?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  expiryDate?: Date;
}

export class CreateGoodsReceiptRequest {
  @ApiProperty({ example: 'GRN-2024-001' })
  grnNumber!: string;

  @ApiProperty({ example: 'uuid' })
  purchaseOrderId!: string;

  @ApiProperty({ example: '2024-12-01' })
  receivedDate!: Date;

  @ApiProperty({ type: [GRNItemRequest] })
  items!: GRNItemRequest[];

  @ApiProperty({ example: 'Draft', enum: ['Draft', 'Verified', 'Completed'], required: false })
  status?: string;

  @ApiProperty({ example: 'All items received in good condition', required: false })
  remarks?: string;
}

export class GoodsReceiptResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'GRN-2024-001' })
  grnNumber!: string;

  @ApiProperty({ example: 'uuid' })
  purchaseOrderId!: string;

  @ApiProperty()
  receivedDate!: Date;

  @ApiProperty({ example: 'Draft' })
  status!: string;

  @ApiProperty({ example: 'All items received in good condition' })
  remarks?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class GRNItemResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  goodsReceiptId!: string;

  @ApiProperty({ example: 'uuid' })
  purchaseOrderItemId!: string;

  @ApiProperty({ example: 100 })
  receivedQuantity!: number;

  @ApiProperty({ example: 95 })
  acceptedQuantity!: number;

  @ApiProperty({ example: 5 })
  rejectedQuantity!: number;

  @ApiProperty({ example: 'BATCH-001' })
  batchNumber?: string;

  @ApiProperty()
  expiryDate?: Date;
}

export class GoodsReceiptWithItemsResponse {
  @ApiProperty({ type: GoodsReceiptResponse })
  grn!: GoodsReceiptResponse;

  @ApiProperty({ type: [GRNItemResponse] })
  items!: GRNItemResponse[];
}

export class GoodsReceiptListResponse {
  @ApiProperty({ type: [GoodsReceiptResponse] })
  docs!: GoodsReceiptResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
