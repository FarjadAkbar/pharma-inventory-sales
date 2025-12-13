import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PermissionsService } from './permissions.service';
import { 
  PERMISSION_PATTERNS,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@repo/shared';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @MessagePattern(PERMISSION_PATTERNS.CREATE)
  create(@Payload() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @MessagePattern(PERMISSION_PATTERNS.LIST)
  findAll() {
    return this.permissionsService.findAll();
  }

  @MessagePattern(PERMISSION_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.permissionsService.findOne(id);
  }

  @MessagePattern(PERMISSION_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updatePermissionDto: UpdatePermissionDto }) {
    return this.permissionsService.update(data.id, data.updatePermissionDto);
  }

  @MessagePattern(PERMISSION_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.permissionsService.delete(id);
  }
}

