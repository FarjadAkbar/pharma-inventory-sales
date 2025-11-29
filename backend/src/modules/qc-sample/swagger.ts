import { ApiProperty } from '@nestjs/swagger';

export class CreateQCSampleRequest {
  @ApiProperty({ example: 'QCS-2024-001' })
  sampleNumber!: string;

  @ApiProperty({ example: 'GoodsReceipt', enum: ['GoodsReceipt', 'Batch'] })
  sourceType!: string;

  @ApiProperty({ example: 'uuid' })
  sourceId!: string;

  @ApiProperty({ example: 'uuid' })
  materialId!: string;

  @ApiProperty({ example: 'Medium', enum: ['Low', 'Medium', 'High'] })
  priority!: string;

  @ApiProperty({ example: 'uuid', required: false })
  assignedTo?: string;
}

export class QCSampleResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'QCS-2024-001' })
  sampleNumber!: string;

  @ApiProperty({ example: 'GoodsReceipt' })
  sourceType!: string;

  @ApiProperty({ example: 'uuid' })
  sourceId!: string;

  @ApiProperty({ example: 'uuid' })
  materialId!: string;

  @ApiProperty({ example: 'Pending' })
  status!: string;

  @ApiProperty({ example: 'Medium' })
  priority!: string;

  @ApiProperty({ example: 'uuid' })
  assignedTo?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class QCSampleListResponse {
  @ApiProperty({ type: [QCSampleResponse] })
  docs!: QCSampleResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
