import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  SITE_PATTERNS,
  CreateSiteDto,
  UpdateSiteDto,
} from '@repo/shared';

@Controller('sites')
export class SitesController {
  constructor(
    @Inject('SITE_SERVICE') private siteClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createSiteDto: CreateSiteDto) {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.CREATE, createSiteDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.LIST, {})
    );
  }

  @Get('types/metadata')
  async getSiteTypes() {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.GET_TYPES, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.GET_BY_ID, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto) {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.UPDATE, { id: +id, updateSiteDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.siteClient.send(SITE_PATTERNS.DELETE, +id)
    );
  }
}

