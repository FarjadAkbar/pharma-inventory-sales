import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSuppliersTable1734567890000 implements MigrationInterface {
    name = 'CreateSuppliersTable1734567890000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "suppliers" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "contactPerson" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "address" character varying NOT NULL,
                "rating" numeric(2,1) NOT NULL DEFAULT 0,
                "status" character varying NOT NULL DEFAULT 'Active',
                "siteIds" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
            )
        `);
        
        // Create index on email for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_suppliers_email" ON "suppliers" ("email")`);
        
        // Create index on status for filtering
        await queryRunner.query(`CREATE INDEX "IDX_suppliers_status" ON "suppliers" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_email"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
    }
}

