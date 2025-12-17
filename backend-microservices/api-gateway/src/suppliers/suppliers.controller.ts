import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  SUPPLIER_PATTERNS,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@repo/shared';

@Controller('suppliers')
export class SuppliersController {
  constructor(
    @Inject('SUPPLIER_SERVICE') private supplierClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await firstValueFrom(
      this.supplierClient.send(SUPPLIER_PATTERNS.CREATE, createSupplierDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.supplierClient.send(SUPPLIER_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.supplierClient.send(SUPPLIER_PATTERNS.GET_BY_ID, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return await firstValueFrom(
      this.supplierClient.send(SUPPLIER_PATTERNS.UPDATE, { id: +id, updateSupplierDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.supplierClient.send(SUPPLIER_PATTERNS.DELETE, +id)
    );
  }
}

