import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePurchaseOrdersTable1732873200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'purchase_orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'poNumber',
            type: 'text',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'supplierId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'siteId',
            type: 'uuid',
            isNullable: true
          },
          {
            name: 'expectedDate',
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
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false
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
      'purchase_orders',
      new TableForeignKey({
        columnNames: ['supplierId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'suppliers',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'purchase_orders',
      new TableIndex({
        name: 'IDX_PURCHASE_ORDERS_PO_NUMBER',
        columnNames: ['poNumber']
      })
    );

    await queryRunner.createIndex(
      'purchase_orders',
      new TableIndex({
        name: 'IDX_PURCHASE_ORDERS_SUPPLIER_ID',
        columnNames: ['supplierId']
      })
    );

    await queryRunner.createIndex(
      'purchase_orders',
      new TableIndex({
        name: 'IDX_PURCHASE_ORDERS_STATUS',
        columnNames: ['status']
      })
    );

    // Create purchase_order_items table
    await queryRunner.createTable(
      new Table({
        name: 'purchase_order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'purchaseOrderId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'materialId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
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
      'purchase_order_items',
      new TableForeignKey({
        columnNames: ['purchaseOrderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase_orders',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'purchase_order_items',
      new TableForeignKey({
        columnNames: ['materialId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'raw_materials',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'purchase_order_items',
      new TableIndex({
        name: 'IDX_PURCHASE_ORDER_ITEMS_PO_ID',
        columnNames: ['purchaseOrderId']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('purchase_order_items', 'IDX_PURCHASE_ORDER_ITEMS_PO_ID');
    
    const itemsTable = await queryRunner.getTable('purchase_order_items');
    const itemsForeignKeys = itemsTable?.foreignKeys || [];
    for (const fk of itemsForeignKeys) {
      await queryRunner.dropForeignKey('purchase_order_items', fk);
    }
    
    await queryRunner.dropTable('purchase_order_items');

    await queryRunner.dropIndex('purchase_orders', 'IDX_PURCHASE_ORDERS_STATUS');
    await queryRunner.dropIndex('purchase_orders', 'IDX_PURCHASE_ORDERS_SUPPLIER_ID');
    await queryRunner.dropIndex('purchase_orders', 'IDX_PURCHASE_ORDERS_PO_NUMBER');
    
    const poTable = await queryRunner.getTable('purchase_orders');
    const poForeignKeys = poTable?.foreignKeys || [];
    for (const fk of poForeignKeys) {
      await queryRunner.dropForeignKey('purchase_orders', fk);
    }
    
    await queryRunner.dropTable('purchase_orders');
  }
}
