import { Controller, Get, Post, Put, Delete, Body, Param, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SITE_PATTERNS, CreateSiteDto, UpdateSiteDto } from '@repo/shared';
import { firstValueFrom } from 'rxjs';

function isConnectionError(err: any): boolean {
  const msg = err?.message || '';
  return /ECONNRESET|ECONNREFUSED|Connection closed|connect ECONNREFUSED/i.test(msg);
}

@Controller('sites')
export class SitesController {
  constructor(@Inject('MASTER_DATA_SERVICE') private client: ClientProxy) {}

  private async send<T>(pattern: object, payload?: any): Promise<T> {
    try {
      return await firstValueFrom(this.client.send(pattern, payload ?? {}));
    } catch (err) {
      console.log(err);
      if (isConnectionError(err)) {
        throw new ServiceUnavailableException(
          'Master data service is temporarily unavailable. Please ensure the service is running.',
        );
      }
      throw err;
    }
  }

  @Post()
  async create(@Body() dto: CreateSiteDto) {
    return this.send(SITE_PATTERNS.CREATE, dto);
  }
  @Get()
  async findAll() {
    return this.send(SITE_PATTERNS.LIST, {});
  }
  @Get('types/metadata')
  async getSiteTypes() {
    return this.send(SITE_PATTERNS.GET_TYPES, {});
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.send(SITE_PATTERNS.GET_BY_ID, +id);
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.send(SITE_PATTERNS.UPDATE, { id: +id, updateSiteDto: dto });
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.send(SITE_PATTERNS.DELETE, +id);
  }
}
