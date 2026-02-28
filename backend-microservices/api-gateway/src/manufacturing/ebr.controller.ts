import { Controller, Get, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MANUFACTURING_PATTERNS } from '@repo/shared';

@Controller('manufacturing/ebr')
export class EbrController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  @Get()
  async getEBRs(
    @Query('batchId') batchId?: string,
    @Query('drugId') drugId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (batchId) params.batchId = parseInt(batchId);
    if (drugId) params.drugId = parseInt(drugId);
    if (status) params.status = status;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.EBR_LIST, params),
    );
    return { success: true, data: result };
  }

  @Get(':batchId')
  async getEBRByBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.EBR_GET_BY_BATCH, batchId),
    );
    return { success: true, data: result };
  }
}
