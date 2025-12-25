import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  QA_DEVIATION_PATTERNS,
  CreateQADeviationDto,
  UpdateQADeviationDto,
  DeviationStatus,
} from '@repo/shared';

@Controller('quality-assurance/deviations')
export class QADeviationsController {
  constructor(
    @Inject('QA_DEVIATION_SERVICE')
    private qaDeviationClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateQADeviationDto) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.CREATE, createDto)
    );
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('severity') severity?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // For now, return all deviations. Filtering can be added later
    const deviations = await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.LIST, {})
    );
    
    // Apply client-side filtering (can be moved to service later)
    let filtered = Array.isArray(deviations) ? deviations : [];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((d: any) => 
        d.title?.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower) ||
        d.deviationNumber?.toLowerCase().includes(searchLower) ||
        d.materialName?.toLowerCase().includes(searchLower) ||
        d.batchNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    if (severity) {
      filtered = filtered.filter((d: any) => d.severity === severity);
    }
    
    if (category) {
      filtered = filtered.filter((d: any) => d.category === category);
    }
    
    if (status) {
      filtered = filtered.filter((d: any) => d.status === status);
    }
    
    if (assignedTo) {
      filtered = filtered.filter((d: any) => d.assignedTo?.toString() === assignedTo);
    }
    
    // Pagination
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginated = filtered.slice(start, end);
    
    return {
      deviations: paginated,
      pagination: {
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum),
        total: filtered.length,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.GET_BY_ID, parseInt(id, 10))
    );
  }

  @Get('source/:sourceType/:sourceId')
  async findBySource(
    @Param('sourceType') sourceType: string,
    @Param('sourceId') sourceId: string,
  ) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.GET_BY_SOURCE, {
        sourceType,
        sourceId: parseInt(sourceId, 10),
      })
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQADeviationDto) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.UPDATE, {
        id: parseInt(id, 10),
        updateDto,
      })
    );
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() body: { assignedTo: number }) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.ASSIGN, {
        id: parseInt(id, 10),
        assignedTo: body.assignedTo,
      })
    );
  }

  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: DeviationStatus }) {
    return await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.UPDATE_STATUS, {
        id: parseInt(id, 10),
        status: body.status,
      })
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await firstValueFrom(
      this.qaDeviationClient.send(QA_DEVIATION_PATTERNS.DELETE, parseInt(id, 10))
    );
  }
}

