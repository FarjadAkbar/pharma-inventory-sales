import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DRUG_PATTERNS, CreateDrugDto, UpdateDrugDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('master-data')
export class DrugsController {
  constructor(@Inject('MASTER_DATA_SERVICE') private masterDataClient: ClientProxy) {}

  @Get('drugs')
  async getDrugs(@Query() query: any) {
    const params: any = {};
    if (query.search) params.search = query.search;
    if (query.dosageForm) params.dosageForm = query.dosageForm;
    if (query.route) params.route = query.route;
    if (query.approvalStatus) params.approvalStatus = query.approvalStatus;
    if (query.therapeuticClass) params.therapeuticClass = query.therapeuticClass;
    if (query.manufacturer) params.manufacturer = query.manufacturer;
    if (query.page) params.page = parseInt(query.page);
    if (query.limit) params.limit = parseInt(query.limit);
    const result = await firstValueFrom(
      this.masterDataClient.send(DRUG_PATTERNS.LIST, params),
    );
    return { success: true, data: result };
  }

  @Post('drugs')
  async createDrug(@Body() createDto: CreateDrugDto) {
    const result = await firstValueFrom(
      this.masterDataClient.send(DRUG_PATTERNS.CREATE, createDto),
    );
    return { success: true, data: result };
  }

  @Get('drugs/:id')
  async getDrug(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.masterDataClient.send(DRUG_PATTERNS.GET_BY_ID, id),
    );
    return { success: true, data: result };
  }

  @Put('drugs')
  async updateDrug(@Body() updateDto: UpdateDrugDto & { id: number }) {
    const { id, ...rest } = updateDto;
    const result = await firstValueFrom(
      this.masterDataClient.send(DRUG_PATTERNS.UPDATE, { id, updateDto: rest }),
    );
    return { success: true, data: result };
  }

  @Delete('drugs')
  async deleteDrug(@Query('id') id: string) {
    await firstValueFrom(
      this.masterDataClient.send(DRUG_PATTERNS.DELETE, parseInt(id)),
    );
    return { success: true, message: 'Drug deleted successfully' };
  }
}
