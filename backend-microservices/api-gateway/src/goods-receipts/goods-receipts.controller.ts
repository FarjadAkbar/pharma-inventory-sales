import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  GOODS_RECEIPT_PATTERNS,
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
} from '@repo/shared';

@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(
    @Inject('GOODS_RECEIPT_SERVICE')
    private goodsReceiptClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateGoodsReceiptDto) {
    return await firstValueFrom(
      this.goodsReceiptClient.send(GOODS_RECEIPT_PATTERNS.CREATE, createDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.goodsReceiptClient.send(GOODS_RECEIPT_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.goodsReceiptClient.send(GOODS_RECEIPT_PATTERNS.GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateGoodsReceiptDto) {
    return await firstValueFrom(
      this.goodsReceiptClient.send(GOODS_RECEIPT_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.goodsReceiptClient.send(GOODS_RECEIPT_PATTERNS.DELETE, parseInt(id, 10))
    );
  }
}

