import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBatchesTable1732873900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'batches',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'batchNumber', type: 'text', isUnique: true },
          { name: 'drugId', type: 'uuid' },
          { name: 'plannedQuantity', type: 'decimal', precision: 10, scale: 2 },
          { name: 'actualQuantity', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'status', type: 'text', default: "'Planned'" },
          { name: 'startDate', type: 'timestamp', isNullable: true },
          { name: 'endDate', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey('batches', new TableForeignKey({
      columnNames: ['drugId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'drugs',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }));

    await queryRunner.createIndex('batches', new TableIndex({
      name: 'IDX_BATCHES_NUMBER',
      columnNames: ['batchNumber']
    }));

    await queryRunner.createIndex('batches', new TableIndex({
      name: 'IDX_BATCHES_STATUS',
      columnNames: ['status']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('batches', 'IDX_BATCHES_STATUS');
    await queryRunner.dropIndex('batches', 'IDX_BATCHES_NUMBER');
    
    const table = await queryRunner.getTable('batches');
    const foreignKeys = table?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('batches', fk);
    }
    
    await queryRunner.dropTable('batches');
  }
}
