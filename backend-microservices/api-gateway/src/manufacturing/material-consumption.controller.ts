import { Controller, Get, Put, Delete, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  UpdateMaterialConsumptionDto,
  MANUFACTURING_PATTERNS,
  MaterialConsumptionStatus,
} from '@repo/shared';

@Controller('manufacturing')
export class MaterialConsumptionController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  @Get('material-consumption')
  async getMaterialConsumptions(
    @Query('batchId') batchId?: string,
    @Query('materialId') materialId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (batchId) params.batchId = parseInt(batchId);
    if (materialId) params.materialId = parseInt(materialId);
    if (status) params.status = status as MaterialConsumptionStatus;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_LIST, params),
    );
    return { success: true, data: result };
  }

  @Get('material-consumption/:id')
  async getMaterialConsumption(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_ID, id),
    );
    return { success: true, data: result };
  }

  @Put('material-consumption/:id')
  async updateMaterialConsumption(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMaterialConsumptionDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_UPDATE, {
        id,
        updateDto,
      }),
    );
    return { success: true, data: result };
  }

  @Delete('material-consumption/:id')
  async deleteMaterialConsumption(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_DELETE, id),
    );
    return { success: true, message: 'Material consumption deleted successfully' };
  }
}
