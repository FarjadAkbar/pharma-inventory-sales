import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765614317137 implements MigrationInterface {
    name = 'Migration1765614317137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sites_type_enum" AS ENUM('hospital', 'clinic', 'pharmacy', 'warehouse', 'manufacturing')`);
        await queryRunner.query(`CREATE TABLE "sites" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying, "city" character varying, "country" character varying, "type" "public"."sites_type_enum", "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sites"`);
        await queryRunner.query(`DROP TYPE "public"."sites_type_enum"`);
    }

}
