import { ApiProperty } from '@nestjs/swagger';

export class CreateQCResultRequest {
  @ApiProperty({ example: 'uuid' })
  sampleId!: string;

  @ApiProperty({ example: 'uuid' })
  testId!: string;

  @ApiProperty({ example: '7.2' })
  resultValue!: string;

  @ApiProperty({ example: true })
  passed!: boolean;

  @ApiProperty({ example: 'uuid' })
  testedBy!: string;

  @ApiProperty({ example: '2024-12-01T10:00:00Z' })
  testedAt!: Date;

  @ApiProperty({ example: 'Within acceptable range', required: false })
  remarks?: string;
}

export class QCResultResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  sampleId!: string;

  @ApiProperty({ example: 'uuid' })
  testId!: string;

  @ApiProperty({ example: '7.2' })
  resultValue!: string;

  @ApiProperty({ example: true })
  passed!: boolean;

  @ApiProperty({ example: 'uuid' })
  testedBy!: string;

  @ApiProperty()
  testedAt!: Date;

  @ApiProperty({ example: 'Within acceptable range' })
  remarks?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class QCResultListResponse {
  @ApiProperty({ type: [QCResultResponse] })
  docs!: QCResultResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
