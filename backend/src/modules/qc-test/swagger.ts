import { ApiProperty } from '@nestjs/swagger';

export class CreateQCTestRequest {
  @ApiProperty({ example: 'pH Test' })
  name!: string;

  @ApiProperty({ example: 'Measures pH level of solution' })
  description!: string;

  @ApiProperty({ example: 'Chemical' })
  materialType!: string;

  @ApiProperty({ example: '{"minPH": 6.5, "maxPH": 7.5}' })
  specifications!: string;
}

export class QCTestResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'pH Test' })
  name!: string;

  @ApiProperty({ example: 'Measures pH level of solution' })
  description!: string;

  @ApiProperty({ example: 'Chemical' })
  materialType!: string;

  @ApiProperty({ example: '{"minPH": 6.5, "maxPH": 7.5}' })
  specifications!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class QCTestListResponse {
  @ApiProperty({ type: [QCTestResponse] })
  docs!: QCTestResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
