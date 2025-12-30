import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767122779553 implements MigrationInterface {
    name = 'Migration1767122779553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "drugs" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "formula" text, "strength" character varying, "dosageForm" character varying NOT NULL, "route" character varying NOT NULL, "description" text, "approvalStatus" character varying NOT NULL DEFAULT 'Draft', "therapeuticClass" character varying, "manufacturer" character varying, "registrationNumber" character varying, "expiryDate" TIMESTAMP, "storageConditions" text, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ef2680c8815f03b682581f3075" UNIQUE ("code"), CONSTRAINT "PK_a3788abdeb2ec977862b17351ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ef2680c8815f03b682581f307" ON "drugs" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_68ee1c951216ab60f778d0dbed" ON "drugs" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_68ee1c951216ab60f778d0dbed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ef2680c8815f03b682581f307"`);
        await queryRunner.query(`DROP TABLE "drugs"`);
    }

}
