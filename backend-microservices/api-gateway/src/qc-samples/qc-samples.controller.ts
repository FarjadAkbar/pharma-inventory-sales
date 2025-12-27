import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  QC_SAMPLE_PATTERNS,
  CreateQCSampleDto,
  UpdateQCSampleDto,
  AssignTestsToSampleDto,
} from '@repo/shared';

@Controller('qc-samples')
export class QCSamplesController {
  constructor(
    @Inject('QUALITY_CONTROL_SERVICE')
    private qualityControlClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQCSampleDto) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.CREATE, createDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.LIST, {})
    );
  }

  @Get('goods-receipt-item/:goodsReceiptItemId')
  async findByGoodsReceiptItem(@Param('goodsReceiptItemId') goodsReceiptItemId: string) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.GET_BY_GOODS_RECEIPT_ITEM, parseInt(goodsReceiptItemId, 10))
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.GET_BY_ID, parseInt(id, 10))
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQCSampleDto) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Post(':id/receive')
  async receiveSample(@Param('id') id: string) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.RECEIVE_SAMPLE, parseInt(id, 10))
    );
  }

  @Post(':id/assign-tests')
  async assignTests(@Param('id') id: string, @Body() assignTestsDto: AssignTestsToSampleDto) {
    return await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.ASSIGN_TESTS, {
        id: parseInt(id, 10),
        assignTestsDto,
      })
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.qualityControlClient.send(QC_SAMPLE_PATTERNS.DELETE, parseInt(id, 10))
    );
  }
}

