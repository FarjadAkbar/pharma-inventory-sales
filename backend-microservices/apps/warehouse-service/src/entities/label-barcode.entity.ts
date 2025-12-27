import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum LabelType {
  INVENTORY_ITEM = 'Inventory Item',
  PUTAWAY = 'Putaway',
  MATERIAL_ISSUE = 'Material Issue',
  CYCLE_COUNT = 'Cycle Count',
  LOCATION = 'Location',
  BATCH = 'Batch',
}

export enum BarcodeType {
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  EAN13 = 'EAN13',
  QR_CODE = 'QR Code',
  DATA_MATRIX = 'Data Matrix',
}

@Entity('labels_barcodes')
export class LabelBarcode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  barcode: string;

  @Column({ type: 'varchar' })
  labelType: LabelType;

  @Column({ nullable: true })
  @Index()
  referenceId?: number;

  @Column({ nullable: true })
  referenceType?: string;

  @Column({ nullable: true })
  @Index()
  inventoryItemId?: number;

  @Column({ nullable: true })
  @Index()
  putawayItemId?: number;

  @Column({ nullable: true })
  @Index()
  materialIssueId?: number;

  @Column({ nullable: true })
  @Index()
  cycleCountId?: number;

  @Column({ nullable: true })
  @Index()
  locationId?: string;

  @Column({ nullable: true })
  @Index()
  batchNumber?: string;

  @Column({ type: 'varchar', default: BarcodeType.CODE128 })
  barcodeType: BarcodeType;

  @Column({ nullable: true })
  labelData?: string; // JSON string for label content

  @Column({ nullable: true })
  labelTemplate?: string;

  @Column({ default: false })
  isPrinted: boolean;

  @Column('timestamp', { nullable: true })
  printedAt?: Date;

  @Column({ nullable: true })
  printedBy?: number;

  @Column({ default: 0 })
  printCount: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

