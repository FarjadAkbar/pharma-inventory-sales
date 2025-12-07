import { IPermissionRepository } from '../repository/permission';
import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException, ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

import { PermissionEntity, PermissionEntitySchema } from './../entity/permission';

export const PermissionUpdateSchema = PermissionEntitySchema.pick({
  id: true
}).merge(PermissionEntitySchema.omit({ id: true }).partial());

export class PermissionUpdateUsecase implements IUsecase {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(PermissionUpdateSchema)
  async execute(input: PermissionUpdateInput): Promise<PermissionUpdateOutput> {
    const permission = await this.permissionRepository.findById(input.id);

    if (!permission) {
      throw new ApiNotFoundException('permissionNotFound');
    }

    if (input.name) {
      const permissionExists = await this.permissionRepository.existsOnUpdate({
        idNotEquals: input.id,
        nameEquals: input.name
      });

      if (permissionExists) {
        throw new ApiConflictException('permissionExists');
      }
    }

    const entity = new PermissionEntity({ ...permission, ...input });

    await this.permissionRepository.updateOne({ id: entity.id }, entity);

    this.loggerService.info({ message: 'permission updated.', obj: { permission: input } });

    return entity;
  }
}

export type PermissionUpdateInput = Infer<typeof PermissionUpdateSchema>;
export type PermissionUpdateOutput = PermissionEntity;
