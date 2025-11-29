import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateQCResultsTable1732873600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qc_results',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'sampleId', type: 'uuid' },
          { name: 'testId', type: 'uuid' },
          { name: 'resultValue', type: 'text' },
          { name: 'passed', type: 'boolean' },
          { name: 'testedBy', type: 'uuid' },
          { name: 'testedAt', type: 'timestamp' },
          { name: 'remarks', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey('qc_results', new TableForeignKey({
      columnNames: ['sampleId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'qc_samples',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }));

    await queryRunner.createForeignKey('qc_results', new TableForeignKey({
      columnNames: ['testId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'qc_tests',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }));

    await queryRunner.createIndex('qc_results', new TableIndex({
      name: 'IDX_QC_RESULTS_SAMPLE_ID',
      columnNames: ['sampleId']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('qc_results', 'IDX_QC_RESULTS_SAMPLE_ID');
    
    const table = await queryRunner.getTable('qc_results');
    const foreignKeys = table?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('qc_results', fk);
    }
    
    await queryRunner.dropTable('qc_results');
  }
}
