import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@repo/shared';
import { hash } from '@node-rs/bcrypt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ROLE_PATTERNS, SITE_PATTERNS } from '@repo/shared';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('ROLE_SERVICE') private roleClient: ClientProxy,
    @Inject('SITE_SERVICE') private siteClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await hash(createUserDto.password, 10);
    const { siteIds, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      // TypeORM simple-array stores as comma-separated string, but we can pass array and it will convert
      siteIds: siteIds && siteIds.length > 0 ? siteIds : '',
    });
    const saved = await this.usersRepository.save(user);
    return this.enrichUserWithRoleAndSites(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    const usersWithRoles = await Promise.all(
      users.map(user => this.enrichUserWithRoleAndSites(user))
    );
    return usersWithRoles;
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
    });
    if (!user) return null;
    return this.enrichUserWithRoleAndSites(user);
  }

  async findByEmail(email: string): Promise<any | null> {
    // Return full user entity for internal use (auth service needs password)
    const user = await this.usersRepository.findOne({ 
      where: { email },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    const { siteIds, ...userData } = updateUserDto;
    Object.assign(user, userData);
    
    // Handle siteIds - convert array to simple-array format
    if (siteIds !== undefined) {
      user.siteIds = siteIds && siteIds.length > 0 ? siteIds : '';
    }
    
    const saved = await this.usersRepository.save(user);
    return this.enrichUserWithRoleAndSites(saved);
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private async enrichUserWithRoleAndSites(user: User): Promise<UserResponseDto> {
    const { password, ...result } = user;
    let role: { id: number; name: string; permissions: Array<{ id: number; name: string }> } | undefined = undefined;
    let sites: Array<{ id: number; name: string; address?: string; city?: string; type?: string }> = [];
    let siteIds: number[] = [];

    // Parse siteIds from simple-array format
    if (user.siteIds) {
      if (Array.isArray(user.siteIds)) {
        siteIds = user.siteIds;
      } else if (typeof user.siteIds === 'string' && user.siteIds.trim() !== '') {
        siteIds = user.siteIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
    }

    // Fetch role details from roles-service if roleId exists
    if (user.roleId) {
      try {
        const roleData = await firstValueFrom(
          this.roleClient.send(ROLE_PATTERNS.GET_BY_ID, user.roleId)
        ).catch(() => null);

        if (roleData) {
          role = {
            id: roleData.id,
            name: roleData.name,
            permissions: roleData.permissions?.map((p: any) => ({
              id: p.id,
              name: p.name,
            })) || [],
          };
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        // Continue without role if fetch fails
      }
    }

    // Fetch site details from sites-service if siteIds exist
    if (siteIds.length > 0) {
      try {
        const sitePromises = siteIds.map(siteId =>
          firstValueFrom(
            this.siteClient.send(SITE_PATTERNS.GET_BY_ID, siteId)
          ).catch(() => null)
        );
        
        const siteResults = await Promise.all(sitePromises);
        sites = siteResults
          .filter(s => s !== null)
          .map(s => ({
            id: s.id,
            name: s.name,
            address: s.address,
            city: s.city,
            type: s.type,
          }));
      } catch (error) {
        console.error('Error fetching sites:', error);
        // Continue with empty sites array if fetch fails
      }
    }

    return {
      ...result,
      role,
      siteIds: siteIds.length > 0 ? siteIds : undefined,
      sites: sites.length > 0 ? sites : undefined,
    } as UserResponseDto;
  }
}
