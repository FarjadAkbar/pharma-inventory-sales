import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDrugsTable1732873000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'drugs',
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
            name: 'formula',
            type: 'text',
            isNullable: false
          },
          {
            name: 'strength',
            type: 'text',
            isNullable: false
          },
          {
            name: 'dosageForm',
            type: 'text',
            isNullable: false
          },
          {
            name: 'route',
            type: 'text',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false
          },
          {
            name: 'approvalStatus',
            type: 'text',
            default: "'Draft'",
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

    await queryRunner.createIndex(
      'drugs',
      new TableIndex({
        name: 'IDX_DRUGS_CODE',
        columnNames: ['code']
      })
    );

    await queryRunner.createIndex(
      'drugs',
      new TableIndex({
        name: 'IDX_DRUGS_APPROVAL_STATUS',
        columnNames: ['approvalStatus']
      })
    );

    await queryRunner.createIndex(
      'drugs',
      new TableIndex({
        name: 'IDX_DRUGS_NAME',
        columnNames: ['name']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('drugs', 'IDX_DRUGS_NAME');
    await queryRunner.dropIndex('drugs', 'IDX_DRUGS_APPROVAL_STATUS');
    await queryRunner.dropIndex('drugs', 'IDX_DRUGS_CODE');
    await queryRunner.dropTable('drugs');
  }
}
