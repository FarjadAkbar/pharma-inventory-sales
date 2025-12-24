import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766554292258 implements MigrationInterface {
    name = 'Migration1766554292258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "qc_samples" ("id" SERIAL NOT NULL, "sampleNumber" character varying NOT NULL, "sourceType" character varying NOT NULL, "sourceId" integer NOT NULL, "sourceReference" character varying NOT NULL, "goodsReceiptItemId" integer NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "priority" character varying NOT NULL DEFAULT 'Normal', "status" character varying NOT NULL DEFAULT 'Pending', "assignedTo" integer, "requestedBy" integer NOT NULL, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "dueDate" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3baabf81ed69054a08db9334554" UNIQUE ("sampleNumber"), CONSTRAINT "PK_1935b26303d501ec33aa46a7f1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3baabf81ed69054a08db933455" ON "qc_samples" ("sampleNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_0330aa262639f88a63696538e5" ON "qc_samples" ("sourceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3031ba0c59b65fd73854bf61e7" ON "qc_samples" ("goodsReceiptItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2456392a8ece124787042e100c" ON "qc_samples" ("materialId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2456392a8ece124787042e100c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3031ba0c59b65fd73854bf61e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0330aa262639f88a63696538e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3baabf81ed69054a08db933455"`);
        await queryRunner.query(`DROP TABLE "qc_samples"`);
    }

}
