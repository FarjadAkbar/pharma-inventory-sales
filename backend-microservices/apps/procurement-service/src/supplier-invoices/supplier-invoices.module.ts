import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import { SupplierInvoicesController } from './supplier-invoices.controller';
import { SupplierInvoicesService } from './supplier-invoices.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierInvoice])],
  controllers: [SupplierInvoicesController],
  providers: [SupplierInvoicesService],
})
export class SupplierInvoicesModule {}
