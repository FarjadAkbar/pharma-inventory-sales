import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QC_TEST_PATTERNS, CreateQCTestDto, UpdateQCTestDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('qc-tests')
export class QCTestsController {
  constructor(@Inject('QUALITY_SERVICE') private client: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQCTestDto) {
    return firstValueFrom(this.client.send(QC_TEST_PATTERNS.CREATE, createDto));
  }
  @Get()
  async findAll(@Query('materialId') materialId?: string) {
    if (materialId) {
      return firstValueFrom(this.client.send(QC_TEST_PATTERNS.GET_BY_MATERIAL, parseInt(materialId, 10)));
    }
    return firstValueFrom(this.client.send(QC_TEST_PATTERNS.LIST, {}));
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send(QC_TEST_PATTERNS.GET_BY_ID, parseInt(id, 10)));
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQCTestDto) {
    return firstValueFrom(this.client.send(QC_TEST_PATTERNS.UPDATE, { id: parseInt(id, 10), updateDto }));
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(this.client.send(QC_TEST_PATTERNS.DELETE, parseInt(id, 10)));
  }
}
