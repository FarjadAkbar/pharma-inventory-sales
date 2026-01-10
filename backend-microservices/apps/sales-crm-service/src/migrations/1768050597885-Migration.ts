import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768050597885 implements MigrationInterface {
    name = 'Migration1768050597885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "accountNumber" character varying NOT NULL, "accountName" character varying NOT NULL, "accountCode" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "phone" character varying, "email" character varying, "billingAddress" jsonb, "shippingAddress" jsonb, "creditLimit" numeric(10,2), "paymentTerms" text, "assignedSalesRep" integer, "assignedSalesRepName" character varying, "taxId" character varying, "registrationNumber" character varying, "notes" text, "tags" text, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c57d6a982eeaa1d115687b17b63" UNIQUE ("accountNumber"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c57d6a982eeaa1d115687b17b6" ON "accounts" ("accountNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_85a5a52b0e51757e3811e9ed66" ON "accounts" ("accountName") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2f4c0459507c2d985c7ac28e8" ON "accounts" ("accountCode") `);
        await queryRunner.query(`CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "contractNumber" character varying NOT NULL, "title" character varying NOT NULL, "accountId" integer NOT NULL, "accountName" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "renewalDate" TIMESTAMP, "value" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "paymentTerms" text NOT NULL, "contractManager" integer NOT NULL, "contractManagerName" character varying, "signedBy" integer, "signedByName" character varying, "signedDate" TIMESTAMP, "autoRenewal" boolean NOT NULL DEFAULT false, "terms" text NOT NULL, "specialConditions" text, "documentUrl" character varying, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_375897948211b379ad8726c5e63" UNIQUE ("contractNumber"), CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_375897948211b379ad8726c5e6" ON "contracts" ("contractNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_cea24c405eca7df888febed0db" ON "contracts" ("accountId") `);
        await queryRunner.query(`CREATE TABLE "pos_transactions" ("id" SERIAL NOT NULL, "transactionNumber" character varying NOT NULL, "terminalId" character varying NOT NULL, "terminalName" character varying NOT NULL, "siteId" integer NOT NULL, "siteName" character varying NOT NULL, "cashierId" integer NOT NULL, "cashierName" character varying NOT NULL, "customerId" integer, "customerName" character varying, "items" jsonb NOT NULL, "subtotal" numeric(10,2) NOT NULL, "tax" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, "paymentMethod" character varying NOT NULL, "paymentStatus" character varying NOT NULL DEFAULT 'pending', "status" character varying NOT NULL DEFAULT 'draft', "transactionDate" TIMESTAMP NOT NULL, "receiptNumber" character varying, "receiptUrl" character varying, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ce1088c15a6425e45ca109e84fd" UNIQUE ("transactionNumber"), CONSTRAINT "PK_528a082f1148d438d20b0476a52" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ce1088c15a6425e45ca109e84f" ON "pos_transactions" ("transactionNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8fbd79bb7aa1f4bdb9b3be7d2" ON "pos_transactions" ("siteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d1d208557348ae07caed7bf96" ON "pos_transactions" ("customerId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4d1d208557348ae07caed7bf96"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8fbd79bb7aa1f4bdb9b3be7d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce1088c15a6425e45ca109e84f"`);
        await queryRunner.query(`DROP TABLE "pos_transactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cea24c405eca7df888febed0db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_375897948211b379ad8726c5e6"`);
        await queryRunner.query(`DROP TABLE "contracts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2f4c0459507c2d985c7ac28e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85a5a52b0e51757e3811e9ed66"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c57d6a982eeaa1d115687b17b6"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
