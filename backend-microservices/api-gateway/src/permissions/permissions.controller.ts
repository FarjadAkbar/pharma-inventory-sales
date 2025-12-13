import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  PERMISSION_PATTERNS,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@repo/shared';

@Controller('permissions')
export class PermissionsController {
  constructor(
    @Inject('PERMISSION_SERVICE') private permissionClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.CREATE, createPermissionDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.LIST, {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.GET_BY_ID, +id)
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.UPDATE, { id: +id, updatePermissionDto })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.DELETE, +id)
    );
  }
}

