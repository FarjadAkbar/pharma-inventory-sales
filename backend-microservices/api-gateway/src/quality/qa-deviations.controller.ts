import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QA_DEVIATION_PATTERNS, CreateQADeviationDto, UpdateQADeviationDto, DeviationStatus } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('quality-assurance/deviations')
export class QADeviationsController {
  constructor(@Inject('QUALITY_SERVICE') private client: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQADeviationDto) {
    return firstValueFrom(this.client.send(QA_DEVIATION_PATTERNS.CREATE, createDto));
  }
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('severity') severity?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const deviations = await firstValueFrom(this.client.send(QA_DEVIATION_PATTERNS.LIST, {}));
    let filtered = Array.isArray(deviations) ? deviations : [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (d: any) =>
          d.title?.toLowerCase().includes(s) ||
          d.description?.toLowerCase().includes(s) ||
          d.deviationNumber?.toLowerCase().includes(s) ||
          d.materialName?.toLowerCase().includes(s) ||
          d.batchNumber?.toLowerCase().includes(s),
      );
    }
    if (severity) filtered = filtered.filter((d: any) => d.severity === severity);
    if (category) filtered = filtered.filter((d: any) => d.category === category);
    if (status) filtered = filtered.filter((d: any) => d.status === status);
    if (assignedTo) filtered = filtered.filter((d: any) => d.assignedTo?.toString() === assignedTo);
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);
    return {
      deviations: paginated,
      pagination: { page: pageNum, pages: Math.ceil(filtered.length / limitNum), total: filtered.length },
    };
  }
  @Get('source/:sourceType/:sourceId')
  async findBySource(@Param('sourceType') sourceType: string, @Param('sourceId') sourceId: string) {
    return firstValueFrom(
      this.client.send(QA_DEVIATION_PATTERNS.GET_BY_SOURCE, {
        sourceType,
        sourceId: parseInt(sourceId, 10),
      }),
    );
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send(QA_DEVIATION_PATTERNS.GET_BY_ID, parseInt(id, 10)));
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQADeviationDto) {
    return firstValueFrom(this.client.send(QA_DEVIATION_PATTERNS.UPDATE, { id: parseInt(id, 10), updateDto }));
  }
  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() body: { assignedTo: number }) {
    return firstValueFrom(
      this.client.send(QA_DEVIATION_PATTERNS.ASSIGN, { id: parseInt(id, 10), assignedTo: body.assignedTo }),
    );
  }
  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: DeviationStatus }) {
    return firstValueFrom(
      this.client.send(QA_DEVIATION_PATTERNS.UPDATE_STATUS, { id: parseInt(id, 10), status: body.status }),
    );
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(this.client.send(QA_DEVIATION_PATTERNS.DELETE, parseInt(id, 10)));
  }
}
