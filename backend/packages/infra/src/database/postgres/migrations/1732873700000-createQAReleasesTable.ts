import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQAReleasesTable1732873700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qa_releases',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'entityType', type: 'text' },
          { name: 'entityId', type: 'uuid' },
          { name: 'decision', type: 'text' },
          { name: 'qcSampleId', type: 'uuid', isNullable: true },
          { name: 'remarks', type: 'text' },
          { name: 'releasedBy', type: 'uuid' },
          { name: 'releasedAt', type: 'timestamp' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' }
        ]
      }),
      true
    );

    await queryRunner.createIndex('qa_releases', new TableIndex({
      name: 'IDX_QA_RELEASES_ENTITY_ID',
      columnNames: ['entityId']
    }));

    await queryRunner.createIndex('qa_releases', new TableIndex({
      name: 'IDX_QA_RELEASES_DECISION',
      columnNames: ['decision']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('qa_releases', 'IDX_QA_RELEASES_DECISION');
    await queryRunner.dropIndex('qa_releases', 'IDX_QA_RELEASES_ENTITY_ID');
    await queryRunner.dropTable('qa_releases');
  }
}
