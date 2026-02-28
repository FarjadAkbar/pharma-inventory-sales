import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleIsSiteScoped1730211289000 implements MigrationInterface {
  name = 'AddRoleIsSiteScoped1730211289000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ADD COLUMN "isSiteScoped" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isSiteScoped"`);
  }
}
