import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QC_SAMPLE_PATTERNS, CreateQCSampleDto, UpdateQCSampleDto, AssignTestsToSampleDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('qc-samples')
export class QCSamplesController {
  constructor(@Inject('QUALITY_SERVICE') private client: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQCSampleDto) {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.CREATE, createDto));
  }
  @Get()
  async findAll() {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.LIST, {}));
  }
  @Get('goods-receipt-item/:goodsReceiptItemId')
  async findByGoodsReceiptItem(@Param('goodsReceiptItemId') goodsReceiptItemId: string) {
    return firstValueFrom(
      this.client.send(QC_SAMPLE_PATTERNS.GET_BY_GOODS_RECEIPT_ITEM, parseInt(goodsReceiptItemId, 10)),
    );
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.GET_BY_ID, parseInt(id, 10)));
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQCSampleDto) {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.UPDATE, { id: parseInt(id, 10), updateDto }));
  }
  @Post(':id/receive')
  async receiveSample(@Param('id') id: string) {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.RECEIVE_SAMPLE, parseInt(id, 10)));
  }
  @Post(':id/assign-tests')
  async assignTests(@Param('id') id: string, @Body() assignTestsDto: AssignTestsToSampleDto) {
    return firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.ASSIGN_TESTS, { id: parseInt(id, 10), assignTestsDto }));
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(this.client.send(QC_SAMPLE_PATTERNS.DELETE, parseInt(id, 10)));
  }
}
