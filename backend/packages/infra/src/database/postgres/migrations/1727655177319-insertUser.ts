import { RoleEnum } from '@pharma/utils/constants';
import { UUIDUtils } from '@pharma/utils/uuid';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PermissionSchema } from '../schemas/permission';
import { RoleSchema } from '../schemas/role';
import { UserSchema } from '../schemas/user';
import { UserPasswordSchema } from '../schemas/user-password';
import { userPermissions } from './1727654555722-insertPermissions';

export class insertUser1727655177319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use plain objects instead of entities to avoid circular dependency
    const password: QueryDeepPartialEntity<UserPasswordSchema> = {
      id: UUIDUtils.create(),
      password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    };
    await queryRunner.manager.insert(UserPasswordSchema, password);

    const roles = await queryRunner.manager.find(RoleSchema);

    const userId = UUIDUtils.create();
    const entity: QueryDeepPartialEntity<UserSchema> = {
      id: userId,
      email: 'admin@admin.com',
      name: 'Admin',
      password: password
    };
    await queryRunner.manager.insert(UserSchema, entity);

    for (const role of roles) {
      await queryRunner.query(`INSERT INTO users_roles (users_id, roles_id) VALUES('${userId}', '${role.id}');`);
    }

    const insertPromiseList = [];

    const permissions = await queryRunner.manager.find(PermissionSchema);

    const userRole = roles.find((r) => r.name === RoleEnum.USER);
    const backOfficeRole = roles.find((r) => r.name === RoleEnum.BACKOFFICE);

    for (const userPermission of userPermissions) {
      const permission = permissions.find((p) => p.name === userPermission);
      insertPromiseList.push(
        queryRunner.query(
          `INSERT INTO permissions_roles (roles_id, permissions_id) VALUES ('${userRole?.id}', '${permission?.id}');`
        )
      );
    }

    for (const permission of permissions) {
      insertPromiseList.push(
        queryRunner.query(
          `INSERT INTO permissions_roles (roles_id, permissions_id) VALUES ('${backOfficeRole?.id}', '${permission.id}');`
        )
      );
    }

    await Promise.all(insertPromiseList);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(UserPasswordSchema, {
      password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    });
    await queryRunner.manager.delete(UserSchema, { email: 'admin@admin.com' });
    await queryRunner.query(`Delete from permissions_roles`);
  }
}
