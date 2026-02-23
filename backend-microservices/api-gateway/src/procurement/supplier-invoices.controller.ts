import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  SUPPLIER_INVOICE_PATTERNS,
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceDto,
} from '@repo/shared';

@Controller('supplier-invoices')
export class SupplierInvoicesController {
  constructor(
    @Inject('PROCUREMENT_SERVICE')
    private procurementClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSupplierInvoiceDto) {
    return await firstValueFrom(
      this.procurementClient.send(SUPPLIER_INVOICE_PATTERNS.CREATE, createDto),
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.procurementClient.send(SUPPLIER_INVOICE_PATTERNS.LIST, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.procurementClient.send(SUPPLIER_INVOICE_PATTERNS.GET_BY_ID, parseInt(id, 10)),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateSupplierInvoiceDto) {
    return await firstValueFrom(
      this.procurementClient.send(SUPPLIER_INVOICE_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.procurementClient.send(SUPPLIER_INVOICE_PATTERNS.DELETE, parseInt(id, 10)),
    );
  }
}
