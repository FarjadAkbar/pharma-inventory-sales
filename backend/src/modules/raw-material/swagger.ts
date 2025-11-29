import { ApiProperty } from '@nestjs/swagger';

export class CreateRawMaterialRequest {
  @ApiProperty({ example: 'RM001' })
  code!: string;

  @ApiProperty({ example: 'Aspirin API' })
  name!: string;

  @ApiProperty({ example: 'USP Grade' })
  grade!: string;

  @ApiProperty({ example: 'kg' })
  unitOfMeasure!: string;

  @ApiProperty({ example: 'uuid' })
  supplierId!: string;

  @ApiProperty({ example: 'Store in cool, dry place' })
  storageRequirements!: string;
}

export class UpdateRawMaterialRequest extends CreateRawMaterialRequest {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class RawMaterialResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'RM001' })
  code!: string;

  @ApiProperty({ example: 'Aspirin API' })
  name!: string;

  @ApiProperty({ example: 'USP Grade' })
  grade!: string;

  @ApiProperty({ example: 'kg' })
  unitOfMeasure!: string;

  @ApiProperty({ example: 'uuid' })
  supplierId!: string;

  @ApiProperty({ example: 'Store in cool, dry place' })
  storageRequirements!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class RawMaterialListResponse {
  @ApiProperty({ type: [RawMaterialResponse] })
  docs!: RawMaterialResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
