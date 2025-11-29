import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierRequest {
  @ApiProperty({ example: 'ABC Pharmaceuticals' })
  name!: string;

  @ApiProperty({ example: 'John Doe' })
  contactPerson!: string;

  @ApiProperty({ example: 'contact@abcpharma.com' })
  email!: string;

  @ApiProperty({ example: '+1234567890' })
  phone!: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  address!: string;

  @ApiProperty({ example: 0, required: false })
  rating?: number;

  @ApiProperty({ example: 'Active', enum: ['Active', 'Inactive'], required: false })
  status?: string;
}

export class UpdateSupplierRequest extends CreateSupplierRequest {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class UpdateSupplierRatingRequest {
  @ApiProperty({ example: 4.5, minimum: 0, maximum: 5 })
  rating!: number;
}

export class SupplierResponse {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'ABC Pharmaceuticals' })
  name!: string;

  @ApiProperty({ example: 'John Doe' })
  contactPerson!: string;

  @ApiProperty({ example: 'contact@abcpharma.com' })
  email!: string;

  @ApiProperty({ example: '+1234567890' })
  phone!: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  address!: string;

  @ApiProperty({ example: 4.5 })
  rating!: number;

  @ApiProperty({ example: 'Active' })
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SupplierListResponse {
  @ApiProperty({ type: [SupplierResponse] })
  docs!: SupplierResponse[];

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
