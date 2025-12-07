import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQCTestsTable1732873500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qc_tests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'materialType', type: 'text' },
          { name: 'specifications', type: 'text' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true }
        ]
      }),
      true
    );

    await queryRunner.createIndex('qc_tests', new TableIndex({
      name: 'IDX_QC_TESTS_NAME',
      columnNames: ['name']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('qc_tests', 'IDX_QC_TESTS_NAME');
    await queryRunner.dropTable('qc_tests');
  }
}
