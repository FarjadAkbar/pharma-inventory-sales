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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  RAW_MATERIAL_PATTERNS,
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
} from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('raw-materials')
export class RawMaterialsController {
  constructor(
    @Inject('MASTER_DATA_SERVICE') private masterDataClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createRawMaterialDto: CreateRawMaterialDto) {
    return await firstValueFrom(
      this.masterDataClient.send(RAW_MATERIAL_PATTERNS.CREATE, createRawMaterialDto),
    );
  }

  @Get()
  async findAll(@Query('supplierId') supplierId?: string) {
    if (supplierId) {
      return await firstValueFrom(
        this.masterDataClient.send(RAW_MATERIAL_PATTERNS.GET_BY_SUPPLIER, +supplierId),
      );
    }
    return await firstValueFrom(
      this.masterDataClient.send(RAW_MATERIAL_PATTERNS.LIST, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.masterDataClient.send(RAW_MATERIAL_PATTERNS.GET_BY_ID, +id),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRawMaterialDto: UpdateRawMaterialDto,
  ) {
    return await firstValueFrom(
      this.masterDataClient.send(RAW_MATERIAL_PATTERNS.UPDATE, {
        id: +id,
        updateRawMaterialDto,
      }),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.masterDataClient.send(RAW_MATERIAL_PATTERNS.DELETE, +id),
    );
  }
}
