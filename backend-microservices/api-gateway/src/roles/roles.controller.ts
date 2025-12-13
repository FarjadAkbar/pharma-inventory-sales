import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  ROLE_PATTERNS,
  CreateRoleDto,
  UpdateRoleDto,
  AddPermissionToRoleDto,
  RemovePermissionFromRoleDto,
} from '@repo/shared';

@Controller('roles')
export class RolesController {
  constructor(
    @Inject('ROLE_SERVICE') private roleClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.CREATE, createRoleDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.GET_BY_ID, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.UPDATE, { id: +id, updateRoleDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.DELETE, +id)
    );
  }

  @Post(':id/permissions')
  async addPermission(@Param('id') id: string, @Body() body: { permissionId: number }) {
    const dto: AddPermissionToRoleDto = {
      roleId: +id,
      permissionId: body.permissionId,
    };
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.ADD_PERMISSION, dto)
    );
  }

  @Delete(':id/permissions/:permissionId')
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    const dto: RemovePermissionFromRoleDto = {
      roleId: +id,
      permissionId: +permissionId,
    };
    return await firstValueFrom(
      this.roleClient.send(ROLE_PATTERNS.REMOVE_PERMISSION, dto)
    );
  }
}

