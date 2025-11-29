import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSuppliersTable1732872989000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'suppliers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false
          },
          {
            name: 'contactPerson',
            type: 'text',
            isNullable: false
          },
          {
            name: 'email',
            type: 'text',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'phone',
            type: 'text',
            isNullable: false
          },
          {
            name: 'address',
            type: 'text',
            isNullable: false
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 2,
            scale: 1,
            default: 0,
            isNullable: false
          },
          {
            name: 'status',
            type: 'text',
            default: "'Active'",
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
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIERS_NAME',
        columnNames: ['name']
      })
    );

    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIERS_STATUS',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIERS_EMAIL',
        columnNames: ['email']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIERS_EMAIL');
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIERS_STATUS');
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIERS_NAME');
    await queryRunner.dropTable('suppliers');
  }
}
