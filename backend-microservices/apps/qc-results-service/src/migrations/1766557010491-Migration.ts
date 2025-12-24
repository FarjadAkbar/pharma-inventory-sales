import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766557010491 implements MigrationInterface {
    name = 'Migration1766557010491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "qc_results" ("id" SERIAL NOT NULL, "sampleId" integer NOT NULL, "testId" integer NOT NULL, "resultValue" character varying NOT NULL, "unit" character varying NOT NULL, "passed" boolean NOT NULL, "status" character varying NOT NULL DEFAULT 'Pending', "remarks" text, "performedBy" integer NOT NULL, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), "submittedToQA" boolean NOT NULL DEFAULT false, "submittedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b5b61ec4c10edf10400ca07eb9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8ddb572325655ca54a63458bcf" ON "qc_results" ("sampleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_09ad6ef2405a0a463f135a0507" ON "qc_results" ("testId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_09ad6ef2405a0a463f135a0507"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ddb572325655ca54a63458bcf"`);
        await queryRunner.query(`DROP TABLE "qc_results"`);
    }

}
