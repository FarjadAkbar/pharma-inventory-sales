import { ApiProperty } from '@nestjs/swagger';

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

export class UpdateDeviationRequest {
  @ApiProperty({ example: 'Temperature Deviation Updated', required: false })
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  description?: string;

  @ApiProperty({ example: 'Critical', enum: ['Low', 'Medium', 'High', 'Critical'], required: false })
  severity?: string;

  @ApiProperty({ example: 'Investigating', enum: ['Open', 'Investigating', 'Resolved', 'Closed'], required: false })
  status?: string;

  @ApiProperty({ example: 'Root cause identified', required: false })
  rootCause?: string;

  @ApiProperty({ example: '{"actions": ["Updated actions"]}', required: false })
  correctiveActions?: string;
}
