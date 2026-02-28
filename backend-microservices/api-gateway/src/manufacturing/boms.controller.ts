import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateBOMDto,
  UpdateBOMDto,
  MANUFACTURING_PATTERNS,
  BOMStatus,
} from '@repo/shared';

@Controller('manufacturing/boms')
export class BomsController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  @Get()
  async getBOMs(
    @Query('search') search?: string,
    @Query('drugId') drugId?: string,
    @Query('status') status?: string,
    @Query('version') version?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (drugId) params.drugId = parseInt(drugId);
    if (status) params.status = status as BOMStatus;
    if (version) params.version = parseInt(version);
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_LIST, params),
    );
    return { success: true, data: result };
  }

  @Post()
  async createBOM(@Body() createDto: CreateBOMDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_CREATE, createDto),
    );
    return { success: true, data: result };
  }

  @Get(':id')
  async getBOM(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_GET_BY_ID, id),
    );
    return { success: true, data: result };
  }

  @Put(':id')
  async updateBOM(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBOMDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_UPDATE, { id, updateDto }),
    );
    return { success: true, data: result };
  }

  @Delete(':id')
  async deleteBOM(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_DELETE, id),
    );
    return { success: true, message: 'BOM deleted successfully' };
  }

  @Post(':id/approve')
  async approveBOM(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: number },
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_APPROVE, {
        id,
        approvedBy: body.approvedBy,
      }),
    );
    return { success: true, data: result };
  }
}
