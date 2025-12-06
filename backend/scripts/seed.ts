import { config } from 'dotenv';
import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { PermissionEntity } from '@/core/permission/entity/permission';
import { RoleEntity, RoleEnum } from '@/core/role/entity/role';
import { UserEntity } from '@/core/user/entity/user';
import { UserPasswordEntity } from '@/core/user/entity/user-password';
import { UUIDUtils } from '@/utils/uuid';

import { PermissionSchema } from '@/infra/database/postgres/schemas/permission';
import { RoleSchema } from '@/infra/database/postgres/schemas/role';
import { UserSchema } from '@/infra/database/postgres/schemas/user';
import { UserPasswordSchema } from '@/infra/database/postgres/schemas/user-password';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DATABASE || 'nestjs_microservice',
  namingStrategy: new SnakeNamingStrategy(),
  logging: true,
  entities: [PermissionSchema, RoleSchema, UserSchema, UserPasswordSchema]
});

// Permissions to seed
const userPermissions = [
  'user:logout',
  'user:create',
  'user:update',
  'user:list',
  'user:getbyid',
  'user:changepassword',
  'user:delete'
];

const backofficePermissions = [
  'permission:create',
  'permission:update',
  'permission:getbyid',
  'permission:list',
  'permission:delete',
  'role:create',
  'role:update',
  'role:getbyid',
  'role:list',
  'role:delete',
  'role:addpermission',
  'role:deletepermission'
];

async function seed() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Seed Permissions
      console.log('🌱 Seeding permissions...');
      const existingPermissions = await queryRunner.manager.find(PermissionSchema);
      const existingPermissionNames = existingPermissions.map((p) => p.name);
      const allPermissions = [...userPermissions, ...backofficePermissions];
      const permissionsToCreate = allPermissions.filter((name) => !existingPermissionNames.includes(name));

      const permissionEntities = permissionsToCreate.map(
        (name) => new PermissionEntity({ id: UUIDUtils.create(), name })
      );

      if (permissionEntities.length > 0) {
        await queryRunner.manager.save(PermissionSchema, permissionEntities as any);
        console.log(`✅ Created ${permissionEntities.length} permissions`);
      } else {
        console.log('ℹ️  All permissions already exist');
      }

      // Get all permissions (existing + newly created)
      const allPermissionsInDb = await queryRunner.manager.find(PermissionSchema);

      // 2. Seed Roles
      console.log('🌱 Seeding roles...');
      const existingRoles = await queryRunner.manager.find(RoleSchema);
      const existingRoleNames = existingRoles.map((r) => r.name);

      let userRole = existingRoles.find((r) => r.name === RoleEnum.USER);
      let backofficeRole = existingRoles.find((r) => r.name === RoleEnum.BACKOFFICE);

      if (!userRole) {
        userRole = new RoleEntity({ id: UUIDUtils.create(), name: RoleEnum.USER });
        await queryRunner.manager.save(RoleSchema, userRole as any);
        console.log('✅ Created USER role');
      } else {
        console.log('ℹ️  USER role already exists');
      }

      if (!backofficeRole) {
        backofficeRole = new RoleEntity({ id: UUIDUtils.create(), name: RoleEnum.BACKOFFICE });
        await queryRunner.manager.save(RoleSchema, backofficeRole as any);
        console.log('✅ Created BACKOFFICE role');
      } else {
        console.log('ℹ️  BACKOFFICE role already exists');
      }

      // Refresh roles to get IDs
      const rolesInDb = await queryRunner.manager.find(RoleSchema);
      userRole = rolesInDb.find((r) => r.name === RoleEnum.USER)!;
      backofficeRole = rolesInDb.find((r) => r.name === RoleEnum.BACKOFFICE)!;

      // 3. Assign Permissions to Roles
      console.log('🌱 Assigning permissions to roles...');

      // Assign user permissions to USER role
      const userPermissionIds = allPermissionsInDb
        .filter((p) => userPermissions.includes(p.name))
        .map((p) => p.id);
      for (const permissionId of userPermissionIds) {
        await queryRunner.query(
          `INSERT INTO permissions_roles (roles_id, permissions_id) 
           VALUES ('${userRole.id}', '${permissionId}') 
           ON CONFLICT DO NOTHING`
        );
      }
      console.log(`✅ Assigned ${userPermissionIds.length} permissions to USER role`);

      // Assign all permissions to BACKOFFICE role
      for (const permission of allPermissionsInDb) {
        await queryRunner.query(
          `INSERT INTO permissions_roles (roles_id, permissions_id) 
           VALUES ('${backofficeRole.id}', '${permission.id}') 
           ON CONFLICT DO NOTHING`
        );
      }
      console.log(`✅ Assigned ${allPermissionsInDb.length} permissions to BACKOFFICE role`);

      // 4. Seed Admin User
      console.log('🌱 Seeding admin user...');
      const existingAdmin = await queryRunner.manager.findOne(UserSchema, {
        where: { email: 'admin@admin.com' }
      });

      if (!existingAdmin) {
        // Create password (admin password hashed with SHA256)
        const passwordEntity = new UserPasswordEntity({
          id: UUIDUtils.create(),
          password: 'admin' // Will be hashed
        });
        passwordEntity.createPassword();

        await queryRunner.manager.save(UserPasswordSchema, passwordEntity as any);

        // Create admin user with both roles
        const adminUser = new UserEntity({
          id: UUIDUtils.create(),
          email: 'admin@admin.com',
          name: 'Admin',
          roles: [userRole, backofficeRole].map((r) => new RoleEntity(r)),
          password: passwordEntity
        });

        await queryRunner.manager.save(UserSchema, adminUser as any);

        // Link user to roles
        for (const role of [userRole, backofficeRole]) {
          await queryRunner.query(
            `INSERT INTO users_roles (users_id, roles_id) 
             VALUES ('${adminUser.id}', '${role.id}') 
             ON CONFLICT DO NOTHING`
          );
        }

        console.log('✅ Created admin user (email: admin@admin.com, password: admin)');
      } else {
        console.log('ℹ️  Admin user already exists');
      }

      await queryRunner.commitTransaction();
      console.log('✅ Seeding completed successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
