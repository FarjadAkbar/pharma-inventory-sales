import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';
import {
  PERMISSIONS_CREATE,
  PERMISSIONS_DELETE,
  PERMISSIONS_GET_BY_ID,
  PERMISSIONS_LIST,
  PERMISSIONS_UPDATE
} from '@/constants/message-patterns';

import { PermissionEntity } from '@/core/permission/entity/permission';

@Controller('permissions')
export class PermissionsController {
  constructor(@Inject('PERMISSIONS_SERVICE') private readonly permissionsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('permission:create')
  @HttpCode(201)
  async create(@Req() { body }: ApiRequest) {
    return firstValueFrom(this.permissionsClient.send(PERMISSIONS_CREATE, body));
  }

  @Put(':id')
  @Version('1')
  @Permission('permission:update')
  async update(@Req() { body, params }: ApiRequest) {
    return firstValueFrom(this.permissionsClient.send(PERMISSIONS_UPDATE, { ...body, id: params.id }));
  }

  @Get(':id')
  @Version('1')
  @Permission('permission:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.permissionsClient.send(PERMISSIONS_GET_BY_ID, params));
  }

  @Get()
  @Version('1')
  @Permission('permission:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: (SearchHttpSchema.parse(query.search) as unknown as Partial<PermissionEntity>) || null,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.permissionsClient.send(PERMISSIONS_LIST, input));
  }

  @Delete(':id')
  @Version('1')
  @Permission('permission:delete')
  async delete(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.permissionsClient.send(PERMISSIONS_DELETE, params));
  }
}
