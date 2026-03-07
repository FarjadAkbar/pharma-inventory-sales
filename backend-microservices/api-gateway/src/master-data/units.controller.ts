import { Controller, Get, Post, Put, Delete, Body, Query, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UNIT_PATTERNS } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('master-data')
export class UnitsController {
  constructor(@Inject('MASTER_DATA_SERVICE') private masterDataClient: ClientProxy) {}

  @Get('units')
  async getUnits() {
    const result = await firstValueFrom(
      this.masterDataClient.send(UNIT_PATTERNS.LIST, {}),
    );
    return { success: true, data: Array.isArray(result) ? result : result?.data ?? result };
  }

  @Post('units')
  async createUnit(@Body() dto: any) {
    const result = await firstValueFrom(
      this.masterDataClient.send(UNIT_PATTERNS.CREATE, dto),
    );
    return { success: true, data: result };
  }

  @Get('units/:id')
  async getUnit(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.masterDataClient.send(UNIT_PATTERNS.GET_BY_ID, parseInt(id, 10)),
    );
    return { success: true, data: result };
  }

  @Put('units')
  async updateUnit(@Body() data: { id: number; code?: string; name?: string; symbol?: string }) {
    const result = await firstValueFrom(
      this.masterDataClient.send(UNIT_PATTERNS.UPDATE, data),
    );
    return { success: true, data: result };
  }

  @Delete('units')
  async deleteUnit(@Query('id') id: string) {
    await firstValueFrom(
      this.masterDataClient.send(UNIT_PATTERNS.DELETE, parseInt(id, 10)),
    );
    return { success: true, message: 'Unit deleted successfully' };
  }
}
