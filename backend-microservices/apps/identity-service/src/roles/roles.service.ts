import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  AddPermissionToRoleDto,
  RemovePermissionFromRoleDto,
} from '@repo/shared';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = this.rolesRepository.create({ ...createRoleDto, permissionIds: '' });
    const saved = await this.rolesRepository.save(role);
    return this.enrichRoleWithPermissions(saved);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesRepository.find();
    return Promise.all(roles.map((r) => this.enrichRoleWithPermissions(r)));
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return this.enrichRoleWithPermissions(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    Object.assign(role, updateRoleDto);
    const saved = await this.rolesRepository.save(role);
    return this.enrichRoleWithPermissions(saved);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    await this.rolesRepository.remove(role);
    return { success: true };
  }

  async addPermission(dto: AddPermissionToRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');
    const permission = await this.permissionsRepository.findOne({ where: { id: dto.permissionId } });
    if (!permission) throw new NotFoundException('Permission not found');

    const permissionIds = this.parsePermissionIds(role.permissionIds);
    if (!permissionIds.includes(dto.permissionId)) {
      permissionIds.push(dto.permissionId);
      role.permissionIds = permissionIds.join(',');
      await this.rolesRepository.save(role);
    }
    return this.enrichRoleWithPermissions(role);
  }

  async removePermission(dto: RemovePermissionFromRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');
    let permissionIds = this.parsePermissionIds(role.permissionIds);
    permissionIds = permissionIds.filter((id) => id !== dto.permissionId);
    role.permissionIds = permissionIds.length ? permissionIds.join(',') : '';
    await this.rolesRepository.save(role);
    return this.enrichRoleWithPermissions(role);
  }

  private parsePermissionIds(permissionIds: number[] | string): number[] {
    if (!permissionIds) return [];
    if (Array.isArray(permissionIds)) return permissionIds;
    if (typeof permissionIds === 'string' && permissionIds.trim() !== '') {
      return permissionIds.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
    }
    return [];
  }

  private async enrichRoleWithPermissions(role: Role): Promise<RoleResponseDto> {
    const permissionIds = this.parsePermissionIds(role.permissionIds);
    const permissions: Array<{ id: number; name: string; description?: string; resource?: string; action?: string }> = [];
    if (permissionIds.length > 0) {
      const list = await this.permissionsRepository.find({ where: { id: In(permissionIds) } });
      permissions.push(...list.map((p) => ({ id: p.id, name: p.name, description: p.description, resource: p.resource, action: p.action })));
    }
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
