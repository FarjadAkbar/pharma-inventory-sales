import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766677541517 implements MigrationInterface {
    name = 'Migration1766677541517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory_items" ("id" SERIAL NOT NULL, "itemCode" character varying NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "locationId" character varying, "zone" character varying, "rack" character varying, "shelf" character varying, "position" character varying, "status" character varying NOT NULL DEFAULT 'Available', "expiryDate" TIMESTAMP, "temperature" numeric(5,2), "humidity" numeric(5,2), "goodsReceiptItemId" integer, "qaReleaseId" integer, "remarks" text, "lastUpdated" TIMESTAMP, "lastUpdatedBy" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_85b0b98a83bbb345c1c90a710a9" UNIQUE ("itemCode"), CONSTRAINT "PK_cf2f451407242e132547ac19169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85b0b98a83bbb345c1c90a710a" ON "inventory_items" ("itemCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_c41a0d23389e5ec6c95f6d0670" ON "inventory_items" ("materialId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5cc150033a13a57493a99cd9eb" ON "inventory_items" ("batchNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_42fb754b882559cb2252c3eb65" ON "inventory_items" ("qaReleaseId") `);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" SERIAL NOT NULL, "movementNumber" character varying NOT NULL, "movementType" character varying NOT NULL, "materialId" integer NOT NULL, "materialName" character varying, "materialCode" character varying, "batchNumber" character varying, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "fromLocationId" character varying, "toLocationId" character varying, "referenceId" character varying, "referenceType" character varying, "remarks" text, "performedBy" integer NOT NULL, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4808d1cf7137ca8cca546143e00" UNIQUE ("movementNumber"), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4808d1cf7137ca8cca546143e0" ON "stock_movements" ("movementNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_f016ab2c3790756e22ab9e323f" ON "stock_movements" ("materialId") `);
        await queryRunner.query(`CREATE INDEX "IDX_539eafea45307ae5f54de07f3b" ON "stock_movements" ("referenceId") `);
        await queryRunner.query(`CREATE TABLE "putaway_items" ("id" SERIAL NOT NULL, "putawayNumber" character varying NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Pending', "locationId" character varying, "zone" character varying, "rack" character varying, "shelf" character varying, "position" character varying, "temperature" numeric(5,2), "humidity" numeric(5,2), "goodsReceiptItemId" integer, "qaReleaseId" integer, "requestedBy" integer NOT NULL, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "assignedBy" integer, "assignedAt" TIMESTAMP, "completedBy" integer, "completedAt" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6cc90adf834452d7ce82b484a1" UNIQUE ("putawayNumber"), CONSTRAINT "PK_2a3a83ea54ae7d3f907362c306d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a6cc90adf834452d7ce82b484a" ON "putaway_items" ("putawayNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_d55853e700713629de540447a4" ON "putaway_items" ("materialId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2621c8a89155a207c34252e16" ON "putaway_items" ("qaReleaseId") `);
        await queryRunner.query(`CREATE TABLE "material_issues" ("id" SERIAL NOT NULL, "issueNumber" character varying NOT NULL, "materialId" integer NOT NULL, "materialName" character varying NOT NULL, "materialCode" character varying NOT NULL, "batchNumber" character varying, "quantity" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "fromLocationId" character varying, "toLocationId" character varying, "workOrderId" character varying, "batchId" character varying, "referenceId" character varying, "referenceType" character varying, "status" character varying NOT NULL DEFAULT 'Pending', "requestedBy" integer NOT NULL, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "approvedBy" integer, "approvedAt" TIMESTAMP, "pickedBy" integer, "pickedAt" TIMESTAMP, "issuedBy" integer, "issuedAt" TIMESTAMP, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e0b5503cdcb11b099f857a6bfe0" UNIQUE ("issueNumber"), CONSTRAINT "PK_0b303538eb1e8414d6c52db4886" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e0b5503cdcb11b099f857a6bfe" ON "material_issues" ("issueNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_bcdc9a8eb4baf3e0fbf5c9e634" ON "material_issues" ("materialId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2c40fcf9831ac347708b21065" ON "material_issues" ("referenceId") `);
        await queryRunner.query(`CREATE TABLE "storage_locations" ("id" SERIAL NOT NULL, "locationCode" character varying NOT NULL, "warehouseId" integer NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'Bin', "status" character varying NOT NULL DEFAULT 'Available', "zone" character varying, "aisle" character varying, "rack" character varying, "shelf" character varying, "position" character varying, "capacity" numeric(10,2), "capacityUnit" character varying, "minTemperature" numeric(5,2), "maxTemperature" numeric(5,2), "minHumidity" numeric(5,2), "maxHumidity" numeric(5,2), "requiresTemperatureControl" boolean NOT NULL DEFAULT false, "requiresHumidityControl" boolean NOT NULL DEFAULT false, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_57d628d7dabf3335dd869162af0" UNIQUE ("locationCode"), CONSTRAINT "PK_1f8980d88f9ebaba668dddd27cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_57d628d7dabf3335dd869162af" ON "storage_locations" ("locationCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_e6c89e79de5e00f2386469c7a5" ON "storage_locations" ("warehouseId") `);
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "type" character varying NOT NULL DEFAULT 'Main', "status" character varying NOT NULL DEFAULT 'Active', "siteId" integer, "address" character varying, "city" character varying, "state" character varying, "country" character varying, "postalCode" character varying, "minTemperature" numeric(5,2), "maxTemperature" numeric(5,2), "minHumidity" numeric(5,2), "maxHumidity" numeric(5,2), "managerId" integer, "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d8b96d60ff9a288f5ed862280d9" UNIQUE ("code"), CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d8b96d60ff9a288f5ed862280d" ON "warehouses" ("code") `);
        await queryRunner.query(`CREATE TABLE "cycle_counts" ("id" SERIAL NOT NULL, "countNumber" character varying NOT NULL, "countType" character varying NOT NULL DEFAULT 'Full', "status" character varying NOT NULL DEFAULT 'Planned', "warehouseId" integer, "locationId" character varying, "zone" character varying, "materialId" integer, "batchNumber" character varying, "scheduledDate" TIMESTAMP, "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "assignedTo" integer, "performedBy" integer, "expectedQuantity" numeric(10,2), "countedQuantity" numeric(10,2), "variance" numeric(10,2), "variancePercentage" numeric(5,2), "hasVariance" boolean NOT NULL DEFAULT false, "remarks" text, "adjustmentReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f96547459bf6e1c9cd3b6d33549" UNIQUE ("countNumber"), CONSTRAINT "PK_1c225dacfee469695d22f085f62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f96547459bf6e1c9cd3b6d3354" ON "cycle_counts" ("countNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_74058993e5066ef831bc6468ca" ON "cycle_counts" ("warehouseId") `);
        await queryRunner.query(`CREATE TABLE "temperature_logs" ("id" SERIAL NOT NULL, "logType" character varying NOT NULL DEFAULT 'Warehouse', "warehouseId" integer, "locationId" character varying, "inventoryItemId" integer, "putawayItemId" integer, "temperature" numeric(5,2) NOT NULL, "humidity" numeric(5,2), "status" character varying NOT NULL DEFAULT 'Normal', "minThreshold" numeric(5,2), "maxThreshold" numeric(5,2), "isOutOfRange" boolean NOT NULL DEFAULT false, "sensorId" character varying, "sensorName" character varying, "remarks" text, "loggedAt" TIMESTAMP NOT NULL DEFAULT now(), "loggedBy" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7738b8501fbf3aa21698f99a34f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9ead317386a77229a9d3b25c8" ON "temperature_logs" ("warehouseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2bcd3b2bb4b1c603326bbb28e6" ON "temperature_logs" ("inventoryItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2772de357ed01a1360a5101da" ON "temperature_logs" ("putawayItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_65f4b4039f54043a4ee4244c89" ON "temperature_logs" ("loggedAt") `);
        await queryRunner.query(`CREATE TABLE "labels_barcodes" ("id" SERIAL NOT NULL, "barcode" character varying NOT NULL, "labelType" character varying NOT NULL, "referenceId" integer, "referenceType" character varying, "inventoryItemId" integer, "putawayItemId" integer, "materialIssueId" integer, "cycleCountId" integer, "locationId" character varying, "batchNumber" character varying, "barcodeType" character varying NOT NULL DEFAULT 'CODE128', "labelData" character varying, "labelTemplate" character varying, "isPrinted" boolean NOT NULL DEFAULT false, "printedAt" TIMESTAMP, "printedBy" integer, "printCount" integer NOT NULL DEFAULT '0', "remarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c3f3959e00e4413ea1b7848b361" UNIQUE ("barcode"), CONSTRAINT "PK_d8299f2bf9d9569143a6f021fb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c3f3959e00e4413ea1b7848b36" ON "labels_barcodes" ("barcode") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c1d519c44f0613a7360c9c6e7" ON "labels_barcodes" ("referenceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a31f4c8431dfcc34af7edce04a" ON "labels_barcodes" ("inventoryItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8890efaa3f9f1245746f9dcc77" ON "labels_barcodes" ("putawayItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e62d78666eea0ed8ce885bcfe4" ON "labels_barcodes" ("materialIssueId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b68ee72935b14b7a36110ee0f1" ON "labels_barcodes" ("cycleCountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a1a717699d4b7c5977d5373f45" ON "labels_barcodes" ("locationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_09cedcc3f098b89a13e67936ac" ON "labels_barcodes" ("batchNumber") `);
        await queryRunner.query(`ALTER TABLE "storage_locations" ADD CONSTRAINT "FK_e6c89e79de5e00f2386469c7a58" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "storage_locations" DROP CONSTRAINT "FK_e6c89e79de5e00f2386469c7a58"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09cedcc3f098b89a13e67936ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1a717699d4b7c5977d5373f45"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b68ee72935b14b7a36110ee0f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e62d78666eea0ed8ce885bcfe4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8890efaa3f9f1245746f9dcc77"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a31f4c8431dfcc34af7edce04a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c1d519c44f0613a7360c9c6e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3f3959e00e4413ea1b7848b36"`);
        await queryRunner.query(`DROP TABLE "labels_barcodes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65f4b4039f54043a4ee4244c89"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2772de357ed01a1360a5101da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bcd3b2bb4b1c603326bbb28e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9ead317386a77229a9d3b25c8"`);
        await queryRunner.query(`DROP TABLE "temperature_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74058993e5066ef831bc6468ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f96547459bf6e1c9cd3b6d3354"`);
        await queryRunner.query(`DROP TABLE "cycle_counts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8b96d60ff9a288f5ed862280d"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6c89e79de5e00f2386469c7a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57d628d7dabf3335dd869162af"`);
        await queryRunner.query(`DROP TABLE "storage_locations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2c40fcf9831ac347708b21065"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bcdc9a8eb4baf3e0fbf5c9e634"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e0b5503cdcb11b099f857a6bfe"`);
        await queryRunner.query(`DROP TABLE "material_issues"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2621c8a89155a207c34252e16"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d55853e700713629de540447a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6cc90adf834452d7ce82b484a"`);
        await queryRunner.query(`DROP TABLE "putaway_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_539eafea45307ae5f54de07f3b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f016ab2c3790756e22ab9e323f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4808d1cf7137ca8cca546143e0"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42fb754b882559cb2252c3eb65"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5cc150033a13a57493a99cd9eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c41a0d23389e5ec6c95f6d0670"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85b0b98a83bbb345c1c90a710a"`);
        await queryRunner.query(`DROP TABLE "inventory_items"`);
    }

}
