import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767033339389 implements MigrationInterface {
    name = 'Migration1767033339389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_orders" ("id" SERIAL NOT NULL, "workOrderNumber" character varying NOT NULL, "drugId" integer NOT NULL, "drugName" character varying NOT NULL, "drugCode" character varying NOT NULL, "siteId" integer NOT NULL, "siteName" character varying NOT NULL, "plannedQuantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "bomVersion" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'Draft', "priority" character varying NOT NULL DEFAULT 'Normal', "plannedStartDate" TIMESTAMP NOT NULL, "plannedEndDate" TIMESTAMP NOT NULL, "actualStartDate" TIMESTAMP, "actualEndDate" TIMESTAMP, "assignedTo" integer, "createdBy" integer NOT NULL, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f26e571a0d252246e65c559eb8e" UNIQUE ("workOrderNumber"), CONSTRAINT "PK_29f6c1884082ee6f535aed93660" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f26e571a0d252246e65c559eb8" ON "work_orders" ("workOrderNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c63c78b3ddb02c9ee677e7c4a" ON "work_orders" ("drugId") `);
        await queryRunner.query(`CREATE INDEX "IDX_454eebd299239434effeb24e5e" ON "work_orders" ("siteId") `);
        await queryRunner.query(`CREATE TABLE "batches" ("id" SERIAL NOT NULL, "batchNumber" character varying NOT NULL, "workOrderId" integer NOT NULL, "workOrderNumber" character varying NOT NULL, "drugId" integer NOT NULL, "drugName" character varying NOT NULL, "drugCode" character varying NOT NULL, "siteId" integer NOT NULL, "siteName" character varying NOT NULL, "plannedQuantity" numeric(10,2) NOT NULL, "actualQuantity" numeric(10,2), "unit" character varying NOT NULL, "bomVersion" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'Draft', "priority" character varying NOT NULL DEFAULT 'Normal', "plannedStartDate" TIMESTAMP NOT NULL, "plannedEndDate" TIMESTAMP NOT NULL, "actualStartDate" TIMESTAMP, "actualEndDate" TIMESTAMP, "startedBy" integer, "startedAt" TIMESTAMP, "completedBy" integer, "completedAt" TIMESTAMP, "hasFault" boolean NOT NULL DEFAULT false, "faultDescription" text, "qcSampleId" integer, "putawayId" integer, "createdBy" integer NOT NULL, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_54653a69252ad13977e8e834fc5" UNIQUE ("batchNumber"), CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_54653a69252ad13977e8e834fc" ON "batches" ("batchNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_d399e45b50dace9b43dfa44798" ON "batches" ("workOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff7fd34b6436cbd184a64529a7" ON "batches" ("drugId") `);
        await queryRunner.query(`CREATE INDEX "IDX_569be34db2e638124586a48a88" ON "batches" ("siteId") `);
        await queryRunner.query(`CREATE TABLE "batch_steps" ("id" SERIAL NOT NULL, "batchId" integer NOT NULL, "stepNumber" integer NOT NULL, "stepName" character varying NOT NULL, "instruction" text NOT NULL, "description" text, "parameters" jsonb, "status" character varying NOT NULL DEFAULT 'Pending', "performedBy" integer, "performedAt" TIMESTAMP, "eSignature" text, "remarks" text, "attachments" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_10b07caf507cf0000dc92773234" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d335d0e144c732abff00bd990" ON "batch_steps" ("batchId") `);
        await queryRunner.query(`CREATE TABLE "material_consumptions" ("id" SERIAL NOT NULL, "batchId" integer NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "plannedQuantity" numeric(10,2) NOT NULL, "actualQuantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Consumed', "locationId" integer, "consumedAt" TIMESTAMP NOT NULL DEFAULT now(), "consumedBy" integer NOT NULL, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8a6a77d1206f3c14965feb1c9bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b45ee73dcff2ecbfbd3a96575" ON "material_consumptions" ("batchId") `);
        await queryRunner.query(`CREATE INDEX "IDX_08ab41a3a22aa0e7a91a5927b6" ON "material_consumptions" ("materialId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_08ab41a3a22aa0e7a91a5927b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b45ee73dcff2ecbfbd3a96575"`);
        await queryRunner.query(`DROP TABLE "material_consumptions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d335d0e144c732abff00bd990"`);
        await queryRunner.query(`DROP TABLE "batch_steps"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_569be34db2e638124586a48a88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff7fd34b6436cbd184a64529a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d399e45b50dace9b43dfa44798"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54653a69252ad13977e8e834fc"`);
        await queryRunner.query(`DROP TABLE "batches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_454eebd299239434effeb24e5e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6c63c78b3ddb02c9ee677e7c4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f26e571a0d252246e65c559eb8"`);
        await queryRunner.query(`DROP TABLE "work_orders"`);
    }

}
