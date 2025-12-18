import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  PURCHASE_ORDER_PATTERNS,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '@repo/shared';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    @Inject('PURCHASE_ORDER_SERVICE')
    private purchaseOrderClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePurchaseOrderDto) {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.CREATE, createDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.DELETE, parseInt(id, 10))
    );
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.APPROVE, parseInt(id, 10))
    );
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return await firstValueFrom(
      this.purchaseOrderClient.send(PURCHASE_ORDER_PATTERNS.CANCEL, parseInt(id, 10))
    );
  }
}

