import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDeviationsTable1732873800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deviations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'deviationNumber', type: 'text', isUnique: true },
          { name: 'title', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'severity', type: 'text' },
          { name: 'status', type: 'text', default: "'Open'" },
          { name: 'rootCause', type: 'text', isNullable: true },
          { name: 'correctiveActions', type: 'text' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' }
        ]
      }),
      true
    );

    await queryRunner.createIndex('deviations', new TableIndex({
      name: 'IDX_DEVIATIONS_NUMBER',
      columnNames: ['deviationNumber']
    }));

    await queryRunner.createIndex('deviations', new TableIndex({
      name: 'IDX_DEVIATIONS_STATUS',
      columnNames: ['status']
    }));

    await queryRunner.createIndex('deviations', new TableIndex({
      name: 'IDX_DEVIATIONS_SEVERITY',
      columnNames: ['severity']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('deviations', 'IDX_DEVIATIONS_SEVERITY');
    await queryRunner.dropIndex('deviations', 'IDX_DEVIATIONS_STATUS');
    await queryRunner.dropIndex('deviations', 'IDX_DEVIATIONS_NUMBER');
    await queryRunner.dropTable('deviations');
  }
}
