import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { User, Role, Permission, RefreshToken } from '../../identity-service/src/entities';
import { Site, Supplier, Drug, RawMaterial, Unit, Category } from '../../master-data-service/src/entities';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  GoodsReceiptItem,
  SupplierInvoice,
} from '../../procurement-service/src/entities';
import {
  Warehouse,
  StorageLocation,
  InventoryItem,
  StockMovement,
  PutawayItem,
  MaterialIssue,
  CycleCount,
  TemperatureLog,
  LabelBarcode,
} from '../../warehouse-service/src/entities';
import {
  QCTest,
  QCTestSpecification,
  QCSample,
  QCResult,
  QARelease,
  QAChecklistItem,
  QADeviation,
} from '../../quality-service/src/entities';

const host = process.env.DATABASE_HOST || 'localhost';
const port = parseInt(process.env.DATABASE_PORT || '5432', 10);
const username = process.env.DATABASE_USER || 'postgres';
const password = process.env.DATABASE_PASSWORD || 'postgres';
const database = process.env.DATABASE_NAME || 'postgres';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [
    User,
    Role,
    Permission,
    RefreshToken,
    Site,
    Supplier,
    Drug,
    RawMaterial,
    Unit,
    Category,
    PurchaseOrder,
    PurchaseOrderItem,
    GoodsReceipt,
    GoodsReceiptItem,
    SupplierInvoice,
    Warehouse,
    StorageLocation,
    InventoryItem,
    StockMovement,
    PutawayItem,
    MaterialIssue,
    CycleCount,
    TemperatureLog,
    LabelBarcode,
    QCTest,
    QCTestSpecification,
    QCSample,
    QCResult,
    QARelease,
    QAChecklistItem,
    QADeviation,
  ],
  // Create tables from entities if they don't exist (single-DB dev setup). Set SEEDER_SYNCHRONIZE=false if you run migrations yourself.
  synchronize: process.env.SEEDER_SYNCHRONIZE !== 'false',
  logging: process.env.NODE_ENV === 'development',
});
