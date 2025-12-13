import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { 
  ROLE_PATTERNS,
  CreateRoleDto,
  UpdateRoleDto,
  AddPermissionToRoleDto,
  RemovePermissionFromRoleDto,
} from '@repo/shared';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern(ROLE_PATTERNS.CREATE)
  create(@Payload() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @MessagePattern(ROLE_PATTERNS.LIST)
  findAll() {
    return this.rolesService.findAll();
  }

  @MessagePattern(ROLE_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.rolesService.findOne(id);
  }

  @MessagePattern(ROLE_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateRoleDto: UpdateRoleDto }) {
    return this.rolesService.update(data.id, data.updateRoleDto);
  }

  @MessagePattern(ROLE_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.rolesService.delete(id);
  }

  @MessagePattern(ROLE_PATTERNS.ADD_PERMISSION)
  addPermission(@Payload() dto: AddPermissionToRoleDto) {
    return this.rolesService.addPermission(dto);
  }

  @MessagePattern(ROLE_PATTERNS.REMOVE_PERMISSION)
  removePermission(@Payload() dto: RemovePermissionFromRoleDto) {
    return this.rolesService.removePermission(dto);
  }
}

