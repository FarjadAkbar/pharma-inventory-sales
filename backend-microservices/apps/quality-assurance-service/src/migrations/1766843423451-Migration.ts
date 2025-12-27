import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766843423451 implements MigrationInterface {
    name = 'Migration1766843423451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "qa_checklist_items" ("id" SERIAL NOT NULL, "releaseId" integer NOT NULL, "item" character varying NOT NULL, "checked" boolean NOT NULL DEFAULT false, "remarks" text, CONSTRAINT "PK_429ba1dcfb0cc2c80eb67a1d361" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_04149047f9450e979a622c8214" ON "qa_checklist_items" ("releaseId") `);
        await queryRunner.query(`CREATE TABLE "qa_releases" ("id" SERIAL NOT NULL, "releaseNumber" character varying NOT NULL, "sampleId" integer NOT NULL, "goodsReceiptItemId" integer NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Pending', "decision" character varying, "decisionReason" text, "qcResultIds" text, "submittedBy" integer NOT NULL, "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), "reviewedBy" integer, "reviewedAt" TIMESTAMP, "decidedBy" integer, "decidedAt" TIMESTAMP, "eSignature" text, "remarks" text, "warehouseNotified" boolean NOT NULL DEFAULT false, "warehouseNotifiedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2146d38597834761af8d765f767" UNIQUE ("releaseNumber"), CONSTRAINT "PK_901fe65e2604f6fdb950d9c63ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2146d38597834761af8d765f76" ON "qa_releases" ("releaseNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_f86ad1736b912db0ff0d3d7d7b" ON "qa_releases" ("sampleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bb58e5250648b4c8e1cf257cec" ON "qa_releases" ("goodsReceiptItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b379c389b419933c02bed1d824" ON "qa_releases" ("materialId") `);
        await queryRunner.query(`CREATE TABLE "qa_deviations" ("id" SERIAL NOT NULL, "deviationNumber" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "severity" character varying NOT NULL, "category" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Open', "sourceType" character varying NOT NULL, "sourceId" integer NOT NULL, "sourceReference" character varying NOT NULL, "materialId" integer, "materialName" character varying, "batchNumber" character varying, "discoveredBy" integer NOT NULL, "discoveredAt" TIMESTAMP NOT NULL DEFAULT now(), "assignedTo" integer, "assignedAt" TIMESTAMP, "dueDate" TIMESTAMP, "closedAt" TIMESTAMP, "rootCause" text, "immediateAction" text, "correctiveAction" text, "preventiveAction" text, "effectivenessCheck" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a0d635649ec8cb63af770789111" UNIQUE ("deviationNumber"), CONSTRAINT "PK_66a018b9c23ee9667bc8bd1527f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a0d635649ec8cb63af77078911" ON "qa_deviations" ("deviationNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_c1cd7ba81ac1af88d4bc2ab537" ON "qa_deviations" ("sourceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a7d040aa62a44c69a7fd4e691f" ON "qa_deviations" ("materialId") `);
        await queryRunner.query(`ALTER TABLE "qa_checklist_items" ADD CONSTRAINT "FK_04149047f9450e979a622c8214f" FOREIGN KEY ("releaseId") REFERENCES "qa_releases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qa_checklist_items" DROP CONSTRAINT "FK_04149047f9450e979a622c8214f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a7d040aa62a44c69a7fd4e691f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1cd7ba81ac1af88d4bc2ab537"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0d635649ec8cb63af77078911"`);
        await queryRunner.query(`DROP TABLE "qa_deviations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b379c389b419933c02bed1d824"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb58e5250648b4c8e1cf257cec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f86ad1736b912db0ff0d3d7d7b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2146d38597834761af8d765f76"`);
        await queryRunner.query(`DROP TABLE "qa_releases"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04149047f9450e979a622c8214"`);
        await queryRunner.query(`DROP TABLE "qa_checklist_items"`);
    }

}
