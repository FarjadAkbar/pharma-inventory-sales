import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767723768660 implements MigrationInterface {
    name = 'Migration1767723768660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sales_order_items" ("id" SERIAL NOT NULL, "salesOrderId" integer NOT NULL, "drugId" integer NOT NULL, "drugName" character varying NOT NULL, "drugCode" character varying NOT NULL, "batchPreference" character varying, "preferredBatchId" integer, "preferredBatchNumber" character varying, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "allocatedQuantity" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'Pending', "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5f8d983ae4db44dcc923faf2ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b67146a69ed5fe5fe7f3224d3" ON "sales_order_items" ("salesOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f00e5be1366da0bdaaad8d99d" ON "sales_order_items" ("drugId") `);
        await queryRunner.query(`CREATE TABLE "sales_orders" ("id" SERIAL NOT NULL, "orderNumber" character varying NOT NULL, "accountId" integer NOT NULL, "accountName" character varying NOT NULL, "accountCode" character varying NOT NULL, "siteId" integer NOT NULL, "siteName" character varying NOT NULL, "requestedShipDate" TIMESTAMP NOT NULL, "actualShipDate" TIMESTAMP, "deliveryDate" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'Draft', "priority" character varying NOT NULL DEFAULT 'Normal', "totalAmount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "specialInstructions" text, "shippingAddress" jsonb NOT NULL, "billingAddress" jsonb NOT NULL, "createdBy" integer NOT NULL, "approvedBy" integer, "approvedAt" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ea901f7691ec7f314f072d9dee8" UNIQUE ("orderNumber"), CONSTRAINT "PK_5328297e067ca929fbe7cf989dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea901f7691ec7f314f072d9dee" ON "sales_orders" ("orderNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_0115a9e047063b8b78326979dd" ON "sales_orders" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_32701dd1bd6e3556c595266dce" ON "sales_orders" ("siteId") `);
        await queryRunner.query(`ALTER TABLE "sales_order_items" ADD CONSTRAINT "FK_6b67146a69ed5fe5fe7f3224d31" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_order_items" DROP CONSTRAINT "FK_6b67146a69ed5fe5fe7f3224d31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32701dd1bd6e3556c595266dce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0115a9e047063b8b78326979dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea901f7691ec7f314f072d9dee"`);
        await queryRunner.query(`DROP TABLE "sales_orders"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f00e5be1366da0bdaaad8d99d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b67146a69ed5fe5fe7f3224d3"`);
        await queryRunner.query(`DROP TABLE "sales_order_items"`);
    }

}
