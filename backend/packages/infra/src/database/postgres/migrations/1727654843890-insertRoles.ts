import { RoleEntity, RoleEnum } from '@pharma/core/role/entity/role';
import { UUIDUtils } from '@pharma/utils/uuid';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { RoleSchema } from '../schemas/role';

export class insertRoles1727654843890 implements MigrationInterface {
  entityBackOffice = new RoleEntity({ id: UUIDUtils.create(), name: RoleEnum.BACKOFFICE });
  entityUser = new RoleEntity({ id: UUIDUtils.create(), name: RoleEnum.USER });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(RoleSchema, this.entityBackOffice as QueryDeepPartialEntity<RoleSchema>);
    await queryRunner.manager.insert(RoleSchema, this.entityUser as QueryDeepPartialEntity<RoleSchema>);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(RoleSchema, { id: this.entityBackOffice.id });
    await queryRunner.manager.delete(RoleSchema, { id: this.entityUser.id });
  }
}
