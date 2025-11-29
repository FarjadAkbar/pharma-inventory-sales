import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQCSamplesTable1732873400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qc_samples',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'sampleNumber', type: 'text', isUnique: true },
          { name: 'sourceType', type: 'text' },
          { name: 'sourceId', type: 'uuid' },
          { name: 'materialId', type: 'uuid' },
          { name: 'status', type: 'text', default: "'Pending'" },
          { name: 'priority', type: 'text', default: "'Medium'" },
          { name: 'assignedTo', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' }
        ]
      }),
      true
    );

    await queryRunner.createIndex('qc_samples', new TableIndex({
      name: 'IDX_QC_SAMPLES_NUMBER',
      columnNames: ['sampleNumber']
    }));

    await queryRunner.createIndex('qc_samples', new TableIndex({
      name: 'IDX_QC_SAMPLES_STATUS',
      columnNames: ['status']
    }));

    await queryRunner.createIndex('qc_samples', new TableIndex({
      name: 'IDX_QC_SAMPLES_ASSIGNED_TO',
      columnNames: ['assignedTo']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('qc_samples', 'IDX_QC_SAMPLES_ASSIGNED_TO');
    await queryRunner.dropIndex('qc_samples', 'IDX_QC_SAMPLES_STATUS');
    await queryRunner.dropIndex('qc_samples', 'IDX_QC_SAMPLES_NUMBER');
    await queryRunner.dropTable('qc_samples');
  }
}
