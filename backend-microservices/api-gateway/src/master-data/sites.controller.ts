import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SITE_PATTERNS, CreateSiteDto, UpdateSiteDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

@Controller('sites')
export class SitesController {
  constructor(@Inject('MASTER_DATA_SERVICE') private client: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateSiteDto) {
    return firstValueFrom(this.client.send(SITE_PATTERNS.CREATE, dto));
  }
  @Get()
  async findAll() {
    return firstValueFrom(this.client.send(SITE_PATTERNS.LIST, {}));
  }
  @Get('types/metadata')
  async getSiteTypes() {
    return firstValueFrom(this.client.send(SITE_PATTERNS.GET_TYPES, {}));
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send(SITE_PATTERNS.GET_BY_ID, +id));
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return firstValueFrom(this.client.send(SITE_PATTERNS.UPDATE, { id: +id, updateSiteDto: dto }));
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(SITE_PATTERNS.DELETE, +id));
  }
}
