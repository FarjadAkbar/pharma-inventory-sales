import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBOMTables1730220000000 implements MigrationInterface {
  name = 'AddBOMTables1730220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "boms" (
        "id" SERIAL NOT NULL,
        "bomNumber" character varying NOT NULL,
        "drugId" integer NOT NULL,
        "drugName" character varying NOT NULL,
        "drugCode" character varying NOT NULL,
        "version" integer NOT NULL,
        "status" character varying NOT NULL DEFAULT 'Draft',
        "batchSize" numeric(10,2) NOT NULL,
        "yield" numeric(5,2),
        "effectiveDate" TIMESTAMP,
        "expiryDate" TIMESTAMP,
        "createdBy" integer NOT NULL,
        "approvedBy" integer,
        "approvedAt" TIMESTAMP,
        "remarks" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_boms_bomNumber" UNIQUE ("bomNumber"),
        CONSTRAINT "PK_boms" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_boms_bomNumber" ON "boms" ("bomNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_boms_drugId" ON "boms" ("drugId")`);
    await queryRunner.query(`CREATE INDEX "IDX_boms_version" ON "boms" ("version")`);

    await queryRunner.query(`
      CREATE TABLE "bom_items" (
        "id" SERIAL NOT NULL,
        "bomId" integer NOT NULL,
        "materialId" integer NOT NULL,
        "materialName" character varying NOT NULL,
        "materialCode" character varying NOT NULL,
        "quantityPerBatch" numeric(10,4) NOT NULL,
        "unit" character varying NOT NULL,
        "tolerance" numeric(5,2),
        "isCritical" boolean NOT NULL DEFAULT false,
        "sequence" integer NOT NULL,
        "remarks" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bom_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_bom_items_bomId" ON "bom_items" ("bomId")`);
    await queryRunner.query(`CREATE INDEX "IDX_bom_items_materialId" ON "bom_items" ("materialId")`);
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_bom_items_bomId" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bom_items" DROP CONSTRAINT "FK_bom_items_bomId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bom_items_materialId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bom_items_bomId"`);
    await queryRunner.query(`DROP TABLE "bom_items"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_boms_version"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_boms_drugId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_boms_bomNumber"`);
    await queryRunner.query(`DROP TABLE "boms"`);
  }
}
