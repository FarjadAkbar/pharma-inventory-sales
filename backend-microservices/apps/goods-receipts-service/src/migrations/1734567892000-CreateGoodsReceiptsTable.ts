import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateGoodsReceiptsTable1734567892000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create goods_receipts table
    await queryRunner.createTable(
      new Table({
        name: 'goods_receipts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'grnNumber',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'purchaseOrderId',
            type: 'int',
          },
          {
            name: 'receivedDate',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'Draft'",
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'goods_receipts',
      new TableIndex({
        name: 'IDX_goods_receipts_grnNumber',
        columnNames: ['grnNumber'],
      }),
    );

    await queryRunner.createIndex(
      'goods_receipts',
      new TableIndex({
        name: 'IDX_goods_receipts_purchaseOrderId',
        columnNames: ['purchaseOrderId'],
      }),
    );

    // Create goods_receipt_items table
    await queryRunner.createTable(
      new Table({
        name: 'goods_receipt_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'goodsReceiptId',
            type: 'int',
          },
          {
            name: 'purchaseOrderItemId',
            type: 'int',
          },
          {
            name: 'receivedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'acceptedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'rejectedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'batchNumber',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'expiryDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for items
    await queryRunner.createIndex(
      'goods_receipt_items',
      new TableIndex({
        name: 'IDX_goods_receipt_items_goodsReceiptId',
        columnNames: ['goodsReceiptId'],
      }),
    );

    await queryRunner.createIndex(
      'goods_receipt_items',
      new TableIndex({
        name: 'IDX_goods_receipt_items_purchaseOrderItemId',
        columnNames: ['purchaseOrderItemId'],
      }),
    );

    // Create foreign key for goods_receipt_items -> goods_receipts
    await queryRunner.createForeignKey(
      'goods_receipt_items',
      new TableForeignKey({
        columnNames: ['goodsReceiptId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'goods_receipts',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const goodsReceiptItemsTable = await queryRunner.getTable('goods_receipt_items');
    const foreignKey = goodsReceiptItemsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('goodsReceiptId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('goods_receipt_items', foreignKey);
    }

    // Drop tables
    await queryRunner.dropTable('goods_receipt_items');
    await queryRunner.dropTable('goods_receipts');
  }
}

