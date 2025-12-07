import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRawMaterialsTable1732873100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'raw_materials',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'code',
            type: 'text',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false
          },
          {
            name: 'grade',
            type: 'text',
            isNullable: false
          },
          {
            name: 'unitOfMeasure',
            type: 'text',
            isNullable: false
          },
          {
            name: 'supplierId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'storageRequirements',
            type: 'text',
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
      'raw_materials',
      new TableForeignKey({
        columnNames: ['supplierId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'suppliers',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'raw_materials',
      new TableIndex({
        name: 'IDX_RAW_MATERIALS_CODE',
        columnNames: ['code']
      })
    );

    await queryRunner.createIndex(
      'raw_materials',
      new TableIndex({
        name: 'IDX_RAW_MATERIALS_SUPPLIER_ID',
        columnNames: ['supplierId']
      })
    );

    await queryRunner.createIndex(
      'raw_materials',
      new TableIndex({
        name: 'IDX_RAW_MATERIALS_NAME',
        columnNames: ['name']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('raw_materials', 'IDX_RAW_MATERIALS_NAME');
    await queryRunner.dropIndex('raw_materials', 'IDX_RAW_MATERIALS_SUPPLIER_ID');
    await queryRunner.dropIndex('raw_materials', 'IDX_RAW_MATERIALS_CODE');
    
    const table = await queryRunner.getTable('raw_materials');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('supplierId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('raw_materials', foreignKey);
    }
    
    await queryRunner.dropTable('raw_materials');
  }
}
