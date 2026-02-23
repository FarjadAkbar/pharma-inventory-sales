import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SUPPLIER_PATTERNS, CreateSupplierDto, UpdateSupplierDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('suppliers')
export class SuppliersController {
  constructor(
    @Inject('MASTER_DATA_SERVICE') private masterDataClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await firstValueFrom(
      this.masterDataClient.send(SUPPLIER_PATTERNS.CREATE, createSupplierDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.masterDataClient.send(SUPPLIER_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.masterDataClient.send(SUPPLIER_PATTERNS.GET_BY_ID, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return await firstValueFrom(
      this.masterDataClient.send(SUPPLIER_PATTERNS.UPDATE, { id: +id, updateSupplierDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.masterDataClient.send(SUPPLIER_PATTERNS.DELETE, +id)
    );
  }
}
