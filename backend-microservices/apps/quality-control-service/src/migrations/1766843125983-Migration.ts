import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766843125983 implements MigrationInterface {
    name = 'Migration1766843125983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "qc_test_specifications" ("id" SERIAL NOT NULL, "testId" integer NOT NULL, "parameter" character varying NOT NULL, "minValue" character varying, "maxValue" character varying, "targetValue" character varying, "unit" character varying NOT NULL, "method" character varying, CONSTRAINT "PK_8544bd77cce740ba38f6f006c16" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4744c56a94b455f9029f8ca047" ON "qc_test_specifications" ("testId") `);
        await queryRunner.query(`CREATE TABLE "qc_tests" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying, "description" text, "category" character varying, "status" character varying NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cdddd77459fa374d6e9f10bde78" UNIQUE ("code"), CONSTRAINT "PK_a0fdb2dfc1d86a0232f987987e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cdddd77459fa374d6e9f10bde7" ON "qc_tests" ("code") `);
        await queryRunner.query(`CREATE TABLE "qc_samples" ("id" SERIAL NOT NULL, "sampleCode" character varying NOT NULL, "sourceType" character varying NOT NULL, "sourceId" integer NOT NULL, "sourceReference" character varying NOT NULL, "goodsReceiptItemId" integer NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "priority" character varying NOT NULL DEFAULT 'Normal', "status" character varying NOT NULL DEFAULT 'Pending', "assignedTo" integer, "requestedBy" integer NOT NULL, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "dueDate" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3baabf81ed69054a08db9334554" UNIQUE ("sampleCode"), CONSTRAINT "PK_1935b26303d501ec33aa46a7f1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3baabf81ed69054a08db933455" ON "qc_samples" ("sampleCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_0330aa262639f88a63696538e5" ON "qc_samples" ("sourceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3031ba0c59b65fd73854bf61e7" ON "qc_samples" ("goodsReceiptItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2456392a8ece124787042e100c" ON "qc_samples" ("materialId") `);
        await queryRunner.query(`CREATE TABLE "qc_results" ("id" SERIAL NOT NULL, "sampleId" integer NOT NULL, "testId" integer NOT NULL, "resultValue" character varying NOT NULL, "unit" character varying NOT NULL, "passed" boolean NOT NULL, "status" character varying NOT NULL DEFAULT 'Pending', "remarks" text, "performedBy" integer NOT NULL, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), "submittedToQA" boolean NOT NULL DEFAULT false, "submittedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b5b61ec4c10edf10400ca07eb9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8ddb572325655ca54a63458bcf" ON "qc_results" ("sampleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_09ad6ef2405a0a463f135a0507" ON "qc_results" ("testId") `);
        await queryRunner.query(`ALTER TABLE "qc_test_specifications" ADD CONSTRAINT "FK_4744c56a94b455f9029f8ca0470" FOREIGN KEY ("testId") REFERENCES "qc_tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qc_test_specifications" DROP CONSTRAINT "FK_4744c56a94b455f9029f8ca0470"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09ad6ef2405a0a463f135a0507"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ddb572325655ca54a63458bcf"`);
        await queryRunner.query(`DROP TABLE "qc_results"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2456392a8ece124787042e100c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3031ba0c59b65fd73854bf61e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0330aa262639f88a63696538e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3baabf81ed69054a08db933455"`);
        await queryRunner.query(`DROP TABLE "qc_samples"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdddd77459fa374d6e9f10bde7"`);
        await queryRunner.query(`DROP TABLE "qc_tests"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4744c56a94b455f9029f8ca047"`);
        await queryRunner.query(`DROP TABLE "qc_test_specifications"`);
    }

}
