import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateGoodsReceiptsTable1732873300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'goods_receipts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'grnNumber',
            type: 'text',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'purchaseOrderId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'receivedDate',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'status',
            type: 'text',
            default: "'Draft'",
            isNullable: false
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'goods_receipts',
      new TableForeignKey({
        columnNames: ['purchaseOrderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase_orders',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'goods_receipts',
      new TableIndex({
        name: 'IDX_GOODS_RECEIPTS_GRN_NUMBER',
        columnNames: ['grnNumber']
      })
    );

    await queryRunner.createIndex(
      'goods_receipts',
      new TableIndex({
        name: 'IDX_GOODS_RECEIPTS_PO_ID',
        columnNames: ['purchaseOrderId']
      })
    );

    await queryRunner.createIndex(
      'goods_receipts',
      new TableIndex({
        name: 'IDX_GOODS_RECEIPTS_STATUS',
        columnNames: ['status']
      })
    );

    // Create goods_receipt_items table
    await queryRunner.createTable(
      new Table({
        name: 'goods_receipt_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'goodsReceiptId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'purchaseOrderItemId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'receivedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'acceptedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'rejectedQuantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'batchNumber',
            type: 'text',
            isNullable: true
          },
          {
            name: 'expiryDate',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'goods_receipt_items',
      new TableForeignKey({
        columnNames: ['goodsReceiptId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'goods_receipts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'goods_receipt_items',
      new TableForeignKey({
        columnNames: ['purchaseOrderItemId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase_order_items',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'goods_receipt_items',
      new TableIndex({
        name: 'IDX_GOODS_RECEIPT_ITEMS_GRN_ID',
        columnNames: ['goodsReceiptId']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('goods_receipt_items', 'IDX_GOODS_RECEIPT_ITEMS_GRN_ID');
    
    const itemsTable = await queryRunner.getTable('goods_receipt_items');
    const itemsForeignKeys = itemsTable?.foreignKeys || [];
    for (const fk of itemsForeignKeys) {
      await queryRunner.dropForeignKey('goods_receipt_items', fk);
    }
    
    await queryRunner.dropTable('goods_receipt_items');

    await queryRunner.dropIndex('goods_receipts', 'IDX_GOODS_RECEIPTS_STATUS');
    await queryRunner.dropIndex('goods_receipts', 'IDX_GOODS_RECEIPTS_PO_ID');
    await queryRunner.dropIndex('goods_receipts', 'IDX_GOODS_RECEIPTS_GRN_NUMBER');
    
    const grnTable = await queryRunner.getTable('goods_receipts');
    const grnForeignKeys = grnTable?.foreignKeys || [];
    for (const fk of grnForeignKeys) {
      await queryRunner.dropForeignKey('goods_receipts', fk);
    }
    
    await queryRunner.dropTable('goods_receipts');
  }
}
