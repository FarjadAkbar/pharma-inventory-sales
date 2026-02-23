import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';
import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import * as dotenv from 'dotenv';
dotenv.config();

function getTypeOrmOptions(cs?: ConfigService): DataSourceOptions {
  const host = cs?.get<string>('DATABASE_HOST') || process.env.DATABASE_HOST || 'localhost';
  const port = cs?.get<number>('DATABASE_PORT') || (process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432);
  const username = cs?.get<string>('DATABASE_USER') || process.env.DATABASE_USER || 'postgres';
  const password = cs?.get<string>('DATABASE_PASSWORD') || process.env.DATABASE_PASSWORD || 'postgres';
  const database = cs?.get<string>('DATABASE_NAME') || process.env.DATABASE_NAME;
  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, SupplierInvoice],
    migrations: cs ? [] : ['src/migrations/*.ts'],
    synchronize: false,
    logging: cs?.get<string>('NODE_ENV') === 'development' || process.env.NODE_ENV === 'development',
  };
}

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return getTypeOrmOptions(this.configService);
  }
}
export default new DataSource(getTypeOrmOptions());
