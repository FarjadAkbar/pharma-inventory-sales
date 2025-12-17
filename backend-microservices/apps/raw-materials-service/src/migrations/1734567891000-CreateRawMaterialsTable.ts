import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRawMaterialsTable1734567891000 implements MigrationInterface {
    name = 'CreateRawMaterialsTable1734567891000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "raw_materials" (
                "id" SERIAL NOT NULL,
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "grade" character varying,
                "storageRequirements" text,
                "unitOfMeasure" character varying,
                "supplierId" integer NOT NULL,
                "status" character varying NOT NULL DEFAULT 'Active',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_raw_materials" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_raw_materials_code" UNIQUE ("code")
            )
        `);
        
        // Create index on code for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_raw_materials_code" ON "raw_materials" ("code")`);
        
        // Create index on supplierId for filtering
        await queryRunner.query(`CREATE INDEX "IDX_raw_materials_supplierId" ON "raw_materials" ("supplierId")`);
        
        // Create index on status for filtering
        await queryRunner.query(`CREATE INDEX "IDX_raw_materials_status" ON "raw_materials" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_raw_materials_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_raw_materials_supplierId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_raw_materials_code"`);
        await queryRunner.query(`DROP TABLE "raw_materials"`);
    }
}

