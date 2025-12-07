import { RoleEnum } from '@pharma/utils/constants';
import { UUIDUtils } from '@pharma/utils/uuid';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { RoleSchema } from '../schemas/role';

export class insertRoles1727654843890 implements MigrationInterface {
  // Use plain objects instead of entities to avoid circular dependency
  entityBackOffice: QueryDeepPartialEntity<RoleSchema> = {
    id: UUIDUtils.create(),
    name: RoleEnum.BACKOFFICE
  };
  entityUser: QueryDeepPartialEntity<RoleSchema> = {
    id: UUIDUtils.create(),
    name: RoleEnum.USER
  };

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(RoleSchema, this.entityBackOffice);
    await queryRunner.manager.insert(RoleSchema, this.entityUser);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(RoleSchema, { id: this.entityBackOffice.id });
    await queryRunner.manager.delete(RoleSchema, { id: this.entityUser.id });
  }
}
