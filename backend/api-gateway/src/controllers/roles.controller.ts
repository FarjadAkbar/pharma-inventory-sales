import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';
import {
  ROLES_ADD_PERMISSION,
  ROLES_CREATE,
  ROLES_DELETE,
  ROLES_GET_BY_ID,
  ROLES_LIST,
  ROLES_REMOVE_PERMISSION,
  ROLES_UPDATE
} from '@/constants/message-patterns';

import { RoleEntity } from '@/core/role/entity/role';

@Controller('roles')
export class RolesController {
  constructor(@Inject('ROLES_SERVICE') private readonly rolesClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('role:create')
  @HttpCode(201)
  async create(@Req() { body }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_CREATE, body));
  }

  @Put(':id')
  @Version('1')
  @Permission('role:update')
  async update(@Req() { body, params }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_UPDATE, { ...body, id: params.id }));
  }

  @Get(':id')
  @Version('1')
  @Permission('role:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_GET_BY_ID, params));
  }

  @Get()
  @Version('1')
  @Permission('role:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: (SearchHttpSchema.parse(query.search) as unknown as Partial<RoleEntity>) || null,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.rolesClient.send(ROLES_LIST, input));
  }

  @Delete(':id')
  @Version('1')
  @Permission('role:delete')
  async delete(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_DELETE, params));
  }

  @Put('/add-permissions/:id')
  @Version('1')
  @Permission('role:addpermission')
  async addPermissions(@Req() { body, params }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_ADD_PERMISSION, { ...body, id: params.id }));
  }

  @Put('/remove-permissions/:id')
  @HttpCode(200)
  @Version('1')
  @Permission('role:deletepermission')
  async removePermissions(@Req() { body, params }: ApiRequest) {
    return firstValueFrom(this.rolesClient.send(ROLES_REMOVE_PERMISSION, { ...body, id: params.id }));
  }
}
