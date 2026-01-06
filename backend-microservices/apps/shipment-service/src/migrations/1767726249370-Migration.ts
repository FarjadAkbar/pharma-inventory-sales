import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767726249370 implements MigrationInterface {
    name = 'Migration1767726249370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shipment_items" ("id" SERIAL NOT NULL, "shipmentId" integer NOT NULL, "drugId" integer NOT NULL, "drugName" character varying NOT NULL, "drugCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "location" character varying, "pickedQuantity" numeric(10,2) NOT NULL DEFAULT '0', "packedQuantity" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'Pending', "pickedBy" integer, "pickedByName" character varying, "pickedAt" TIMESTAMP, "packedBy" integer, "packedByName" character varying, "packedAt" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7dfc873be1417190f0e5e001dd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eeef177e88218449410bbb3af4" ON "shipment_items" ("shipmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0558a65e471b90a06ca939bd3" ON "shipment_items" ("drugId") `);
        await queryRunner.query(`CREATE TABLE "proof_of_deliveries" ("id" SERIAL NOT NULL, "podNumber" character varying NOT NULL, "shipmentId" integer NOT NULL, "salesOrderId" integer NOT NULL, "salesOrderNumber" character varying NOT NULL, "deliveryDate" TIMESTAMP NOT NULL, "actualDeliveryDate" TIMESTAMP, "deliveredBy" character varying NOT NULL, "receivedBy" character varying NOT NULL, "receivedBySignature" character varying, "deliveryConditions" jsonb, "itemsReceived" jsonb, "status" character varying NOT NULL DEFAULT 'Pending', "rejectedReason" character varying, "completedBy" integer, "completedByName" character varying, "completedAt" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0b7341dcf6a94a43a33c94a542e" UNIQUE ("podNumber"), CONSTRAINT "PK_f28cda93713eb76874d47b0f055" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0b7341dcf6a94a43a33c94a542" ON "proof_of_deliveries" ("podNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_4aacf6c148aa407e1519c92516" ON "proof_of_deliveries" ("shipmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e62965208deedffb919bc2360c" ON "proof_of_deliveries" ("salesOrderId") `);
        await queryRunner.query(`CREATE TABLE "shipments" ("id" SERIAL NOT NULL, "shipmentNumber" character varying NOT NULL, "salesOrderId" integer NOT NULL, "salesOrderNumber" character varying NOT NULL, "accountId" integer NOT NULL, "accountName" character varying NOT NULL, "siteId" integer NOT NULL, "siteName" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Draft', "priority" character varying NOT NULL DEFAULT 'Normal', "shipmentDate" TIMESTAMP NOT NULL, "expectedDeliveryDate" TIMESTAMP NOT NULL, "actualDeliveryDate" TIMESTAMP, "trackingNumber" character varying, "carrier" character varying NOT NULL, "serviceType" character varying NOT NULL, "shippingAddress" jsonb NOT NULL, "packagingInstructions" jsonb, "specialHandling" jsonb, "temperatureRequirements" jsonb, "createdBy" integer NOT NULL, "createdByName" character varying, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_31113d5a7672c472cf23d276480" UNIQUE ("shipmentNumber"), CONSTRAINT "PK_6deda4532ac542a93eab214b564" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31113d5a7672c472cf23d27648" ON "shipments" ("shipmentNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_d3ed4f18bb7377e36c8ed45cf6" ON "shipments" ("salesOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_34a41ce775f12e2153872a0ea7" ON "shipments" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1553c3f17b31cb8436d1bf2cdf" ON "shipments" ("siteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3300d7adbd17fdb51bdfd8c951" ON "shipments" ("trackingNumber") `);
        await queryRunner.query(`ALTER TABLE "shipment_items" ADD CONSTRAINT "FK_eeef177e88218449410bbb3af44" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "proof_of_deliveries" ADD CONSTRAINT "FK_4aacf6c148aa407e1519c925163" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proof_of_deliveries" DROP CONSTRAINT "FK_4aacf6c148aa407e1519c925163"`);
        await queryRunner.query(`ALTER TABLE "shipment_items" DROP CONSTRAINT "FK_eeef177e88218449410bbb3af44"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3300d7adbd17fdb51bdfd8c951"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1553c3f17b31cb8436d1bf2cdf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34a41ce775f12e2153872a0ea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d3ed4f18bb7377e36c8ed45cf6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31113d5a7672c472cf23d27648"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e62965208deedffb919bc2360c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4aacf6c148aa407e1519c92516"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b7341dcf6a94a43a33c94a542"`);
        await queryRunner.query(`DROP TABLE "proof_of_deliveries"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0558a65e471b90a06ca939bd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eeef177e88218449410bbb3af4"`);
        await queryRunner.query(`DROP TABLE "shipment_items"`);
    }

}
