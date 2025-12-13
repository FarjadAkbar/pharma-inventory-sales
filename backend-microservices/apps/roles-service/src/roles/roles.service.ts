import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleResponseDto,
  AddPermissionToRoleDto,
  RemovePermissionFromRoleDto,
  PERMISSION_PATTERNS,
} from '@repo/shared';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @Inject('PERMISSION_SERVICE') private permissionClient: ClientProxy,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = this.rolesRepository.create({
      ...createRoleDto,
      permissionIds: [], // Initialize with empty array
    });
    const saved = await this.rolesRepository.save(role);
    return this.enrichRoleWithPermissions(saved);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesRepository.find();
    const rolesWithPermissions = await Promise.all(
      roles.map(role => this.enrichRoleWithPermissions(role))
    );
    return rolesWithPermissions;
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ 
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.enrichRoleWithPermissions(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    Object.assign(role, updateRoleDto);
    const saved = await this.rolesRepository.save(role);
    return this.enrichRoleWithPermissions(saved);
  }

  async delete(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }

  async addPermission(dto: AddPermissionToRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ 
      where: { id: dto.roleId },
    });
    
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Verify permission exists in permissions-service
    const permission = await firstValueFrom(
      this.permissionClient.send(PERMISSION_PATTERNS.GET_BY_ID, dto.permissionId)
    ).catch(() => null);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Convert permissionIds to array if it's a string (from database)
    let permissionIds: number[] = [];
    if (role.permissionIds) {
      if (Array.isArray(role.permissionIds)) {
        permissionIds = [...role.permissionIds];
      } else if (typeof role.permissionIds === 'string' && role.permissionIds.trim() !== '') {
        permissionIds = role.permissionIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
    }

    // Check if permission already exists
    const permissionExists = permissionIds.includes(dto.permissionId);
    if (!permissionExists) {
      permissionIds.push(dto.permissionId);
      role.permissionIds = permissionIds;
      await this.rolesRepository.save(role);
    }

    return this.enrichRoleWithPermissions(role);
  }

  async removePermission(dto: RemovePermissionFromRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne({ 
      where: { id: dto.roleId },
    });
    
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Convert permissionIds to array if it's a string (from database)
    let permissionIds: number[] = [];
    if (role.permissionIds) {
      if (Array.isArray(role.permissionIds)) {
        permissionIds = [...role.permissionIds];
      } else if (typeof role.permissionIds === 'string' && role.permissionIds.trim() !== '') {
        permissionIds = role.permissionIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
    }

    if (permissionIds.length > 0) {
      permissionIds = permissionIds.filter(id => id !== dto.permissionId);
      role.permissionIds = permissionIds;
      await this.rolesRepository.save(role);
    }

    return this.enrichRoleWithPermissions(role);
  }

  private async enrichRoleWithPermissions(role: Role): Promise<RoleResponseDto> {
    let permissions: Array<{
      id: number;
      name: string;
      description?: string;
      resource?: string;
      action?: string;
    }> = [];

    // Fetch permission details from permissions-service if permissionIds exist
    // TypeORM simple-array stores as comma-separated string, so we need to handle both cases
    let permissionIds: number[] = [];
    if (role.permissionIds) {
      if (Array.isArray(role.permissionIds)) {
        permissionIds = role.permissionIds;
      } else if (typeof role.permissionIds === 'string' && role.permissionIds.trim() !== '') {
        // Handle comma-separated string from database
        permissionIds = role.permissionIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
    }

    if (permissionIds.length > 0) {
      try {
        // Fetch all permissions in parallel
        const permissionPromises = permissionIds.map(permissionId =>
          firstValueFrom(
            this.permissionClient.send(PERMISSION_PATTERNS.GET_BY_ID, permissionId)
          ).catch(() => null) // Handle case where permission might be deleted
        );
        
        const permissionResults = await Promise.all(permissionPromises);
        permissions = permissionResults
          .filter(p => p !== null)
          .map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            resource: p.resource,
            action: p.action,
          }));
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Continue with empty permissions array if fetch fails
      }
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

