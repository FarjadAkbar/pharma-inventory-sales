import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766648509524 implements MigrationInterface {
    name = 'Migration1766648509524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "qc_test_specifications" ("id" SERIAL NOT NULL, "testId" integer NOT NULL, "parameter" character varying NOT NULL, "minValue" character varying, "maxValue" character varying, "targetValue" character varying, "unit" character varying NOT NULL, "method" character varying, CONSTRAINT "PK_8544bd77cce740ba38f6f006c16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4744c56a94b455f9029f8ca047" ON "qc_test_specifications" ("testId") `);
        await queryRunner.query(`CREATE TABLE "qc_tests" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying, "description" text, "category" character varying, "status" character varying NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cdddd77459fa374d6e9f10bde78" UNIQUE ("code"), CONSTRAINT "PK_a0fdb2dfc1d86a0232f987987e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cdddd77459fa374d6e9f10bde7" ON "qc_tests" ("code") `);
        await queryRunner.query(`ALTER TABLE "qc_test_specifications" ADD CONSTRAINT "FK_4744c56a94b455f9029f8ca0470" FOREIGN KEY ("testId") REFERENCES "qc_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qc_test_specifications" DROP CONSTRAINT "FK_4744c56a94b455f9029f8ca0470"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdddd77459fa374d6e9f10bde7"`);
        await queryRunner.query(`DROP TABLE "qc_tests"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4744c56a94b455f9029f8ca047"`);
        await queryRunner.query(`DROP TABLE "qc_test_specifications"`);
    }

}
