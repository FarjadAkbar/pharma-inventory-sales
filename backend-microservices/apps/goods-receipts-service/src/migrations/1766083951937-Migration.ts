import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766083951937 implements MigrationInterface {
    name = 'Migration1766083951937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "goods_receipt_items" ("id" SERIAL NOT NULL, "goodsReceiptId" integer NOT NULL, "purchaseOrderItemId" integer NOT NULL, "receivedQuantity" numeric(10,2) NOT NULL, "acceptedQuantity" numeric(10,2) NOT NULL, "rejectedQuantity" numeric(10,2) NOT NULL, "batchNumber" character varying, "expiryDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3773489ac01faa49777eed0a14f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d1c1d80926f6e0eedd7b147363" ON "goods_receipt_items" ("goodsReceiptId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d30dc64bd7e7c1171cb3fcabe1" ON "goods_receipt_items" ("purchaseOrderItemId") `);
        await queryRunner.query(`CREATE TABLE "goods_receipts" ("id" SERIAL NOT NULL, "grnNumber" character varying NOT NULL, "purchaseOrderId" integer NOT NULL, "receivedDate" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'Draft', "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a4bea96567327d364aadf77859f" UNIQUE ("grnNumber"), CONSTRAINT "PK_f8cac411be0211f923e1be8534f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a4bea96567327d364aadf77859" ON "goods_receipts" ("grnNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_edf0f2be9e5b2d67313461ac11" ON "goods_receipts" ("purchaseOrderId") `);
        await queryRunner.query(`ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "FK_d1c1d80926f6e0eedd7b1473635" FOREIGN KEY ("goodsReceiptId") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "FK_d1c1d80926f6e0eedd7b1473635"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edf0f2be9e5b2d67313461ac11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4bea96567327d364aadf77859"`);
        await queryRunner.query(`DROP TABLE "goods_receipts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d30dc64bd7e7c1171cb3fcabe1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1c1d80926f6e0eedd7b147363"`);
        await queryRunner.query(`DROP TABLE "goods_receipt_items"`);
    }

}
