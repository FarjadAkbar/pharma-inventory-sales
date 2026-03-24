import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditAndStatusHistory1769000100000 implements MigrationInterface {
  name = 'AuditAndStatusHistory1769000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" SERIAL NOT NULL,
        "entityId" integer NOT NULL,
        "entityType" character varying NOT NULL,
        "action" character varying NOT NULL,
        "actorId" integer,
        "beforeData" jsonb,
        "afterData" jsonb,
        "changedFields" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_id" ON "audit_logs" ("entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entityType")`);

    await queryRunner.query(`
      CREATE TABLE "status_history" (
        "id" SERIAL NOT NULL,
        "entityId" integer NOT NULL,
        "entityType" character varying NOT NULL,
        "fromStatus" character varying,
        "toStatus" character varying NOT NULL,
        "changedBy" integer,
        "reason" text,
        "changedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_status_history_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_status_history_entity_id" ON "status_history" ("entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_status_history_entity_type" ON "status_history" ("entityType")`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_mutation() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'Audit logs are immutable';
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_no_update_audit_logs
      BEFORE UPDATE OR DELETE ON "audit_logs"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_audit_log_mutation();
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_no_update_status_history
      BEFORE UPDATE OR DELETE ON "status_history"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_audit_log_mutation();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_no_update_status_history ON "status_history"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_no_update_audit_logs ON "audit_logs"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS prevent_audit_log_mutation`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_status_history_entity_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_status_history_entity_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "status_history"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
  }
}

