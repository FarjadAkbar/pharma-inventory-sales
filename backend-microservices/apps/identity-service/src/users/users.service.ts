import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@repo/shared';
import { hash } from '@node-rs/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await hash(createUserDto.password, 10);
    const { siteIds, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      siteIds: siteIds && siteIds.length ? siteIds.join(',') : '',
    });
    const saved = await this.usersRepository.save(user);
    return this.enrichUserWithRoleAndSites(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return Promise.all(users.map((u) => this.enrichUserWithRoleAndSites(u)));
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    return this.enrichUserWithRoleAndSites(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (updateUserDto.password) {
      (updateUserDto as Record<string, unknown>).password = await hash(updateUserDto.password, 10);
    }
    const { siteIds, ...rest } = updateUserDto;
    Object.assign(user, rest);
    if (siteIds !== undefined) user.siteIds = siteIds && siteIds.length ? siteIds.join(',') : '';
    const saved = await this.usersRepository.save(user);
    return this.enrichUserWithRoleAndSites(saved);
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }

  private parseSiteIds(siteIds: number[] | string): number[] {
    if (!siteIds) return [];
    if (Array.isArray(siteIds)) return siteIds;
    if (typeof siteIds === 'string' && siteIds.trim()) {
      return siteIds.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
    }
    return [];
  }

  private async enrichUserWithRoleAndSites(user: User): Promise<UserResponseDto> {
    const { password, ...result } = user;
    const siteIds = this.parseSiteIds(user.siteIds);
    let role: { id: number; name: string; permissions: Array<{ id: number; name: string }> } | undefined;
    if (user.roleId) {
      const roleEntity = await this.rolesRepository.findOne({ where: { id: user.roleId } });
      if (roleEntity) {
        const permIds =
          typeof roleEntity.permissionIds === 'string' && roleEntity.permissionIds.trim()
            ? roleEntity.permissionIds.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id))
            : [];
        const permissions = permIds.length
          ? await this.permissionsRepository.find({ where: { id: In(permIds) } })
          : [];
        role = {
          id: roleEntity.id,
          name: roleEntity.name,
          permissions: permissions.map((p) => ({ id: p.id, name: p.name })),
        };
      }
    }
    return {
      ...result,
      role,
      siteIds: siteIds.length ? siteIds : undefined,
      sites: undefined,
    } as UserResponseDto;
  }
}
