import { ApiProperty } from '@nestjs/swagger';

export class CreateQAReleaseRequest {
  @ApiProperty({ example: 'GoodsReceipt', enum: ['GoodsReceipt', 'Batch'] })
  entityType!: string;

  @ApiProperty({ example: 'uuid' })
  entityId!: string;

  @ApiProperty({ example: 'Release', enum: ['Release', 'Reject', 'Hold'] })
  decision!: string;

  @ApiProperty({ example: 'uuid', required: false })
  qcSampleId?: string;

  @ApiProperty({ example: 'All tests passed, approved for release' })
  remarks!: string;

  @ApiProperty({ example: 'uuid' })
  releasedBy!: string;

  @ApiProperty({ example: '2024-12-01T10:00:00Z' })
  releasedAt!: Date;
}

export class CreateDeviationRequest {
  @ApiProperty({ example: 'DEV-2024-001' })
  deviationNumber!: string;

  @ApiProperty({ example: 'Temperature Deviation' })
  title!: string;

  @ApiProperty({ example: 'Storage temperature exceeded limits' })
  description!: string;

  @ApiProperty({ example: 'High', enum: ['Low', 'Medium', 'High', 'Critical'] })
  severity!: string;

  @ApiProperty({ example: 'Cooling system malfunction', required: false })
  rootCause?: string;

  @ApiProperty({ example: '{"actions": ["Repair cooling system", "Review SOP"]}' })
  correctiveActions!: string;
}
