import { ApiProperty } from '@nestjs/swagger';

export class CreateDrugRequest {
  @ApiProperty({ example: 'DRG001' })
  code!: string;

  @ApiProperty({ example: 'Paracetamol' })
  name!: string;

  @ApiProperty({ example: 'C8H9NO2' })
  formula!: string;

  @ApiProperty({ example: '500mg' })
  strength!: string;

  @ApiProperty({ example: 'Tablet' })
  dosageForm!: string;

  @ApiProperty({ example: 'Oral' })
  route!: string;

  @ApiProperty({ example: 'Pain reliever and fever reducer' })
  description!: string;

  @ApiProperty({ example: 'Draft', enum: ['Draft', 'Pending', 'Approved', 'Rejected'], required: false })
  approvalStatus?: string;
}

export class UpdateDrugRequest extends CreateDrugRequest {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class DrugResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'DRG001' })
  code!: string;

  @ApiProperty({ example: 'Paracetamol' })
  name!: string;

  @ApiProperty({ example: 'C8H9NO2' })
  formula!: string;

  @ApiProperty({ example: '500mg' })
  strength!: string;

  @ApiProperty({ example: 'Tablet' })
  dosageForm!: string;

  @ApiProperty({ example: 'Oral' })
  route!: string;

  @ApiProperty({ example: 'Pain reliever and fever reducer' })
  description!: string;

  @ApiProperty({ example: 'Draft' })
  approvalStatus!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class DrugListResponse {
  @ApiProperty({ type: [DrugResponse] })
  docs!: DrugResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
