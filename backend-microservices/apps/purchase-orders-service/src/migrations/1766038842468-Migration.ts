import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766038842468 implements MigrationInterface {
    name = 'Migration1766038842468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_items" ("id" SERIAL NOT NULL, "purchaseOrderId" integer NOT NULL, "rawMaterialId" integer NOT NULL, "quantity" numeric(10,2) NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1de7eb246940b05765d2c99a7e" ON "purchase_order_items" ("purchaseOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_55d9f6f1c2c15a297c9c21d27d" ON "purchase_order_items" ("rawMaterialId") `);
        await queryRunner.query(`CREATE TABLE "purchase_orders" ("id" SERIAL NOT NULL, "poNumber" character varying NOT NULL, "supplierId" integer NOT NULL, "siteId" integer, "expectedDate" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'Draft', "totalAmount" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2e0fc7a6605393a9bd691cdcebe" UNIQUE ("poNumber"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2e0fc7a6605393a9bd691cdceb" ON "purchase_orders" ("poNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_0c3ff892a9f2ed16f59d31ccca" ON "purchase_orders" ("supplierId") `);
        await queryRunner.query(`CREATE INDEX "IDX_62ff1111973e926e67d16390a4" ON "purchase_orders" ("siteId") `);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_1de7eb246940b05765d2c99a7ec" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_1de7eb246940b05765d2c99a7ec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62ff1111973e926e67d16390a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c3ff892a9f2ed16f59d31ccca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e0fc7a6605393a9bd691cdceb"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55d9f6f1c2c15a297c9c21d27d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1de7eb246940b05765d2c99a7e"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
    }

}
