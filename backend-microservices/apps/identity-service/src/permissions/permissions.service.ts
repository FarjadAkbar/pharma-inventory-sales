import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
} from '@repo/shared';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    const saved = await this.permissionsRepository.save(permission);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsRepository.find();
    return permissions.map((p) => this.toResponseDto(p));
  }

  async findOne(id: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    return this.toResponseDto(permission);
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    Object.assign(permission, updatePermissionDto);
    const saved = await this.permissionsRepository.save(permission);
    return this.toResponseDto(saved);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    await this.permissionsRepository.remove(permission);
    return { success: true };
  }

  private toResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
