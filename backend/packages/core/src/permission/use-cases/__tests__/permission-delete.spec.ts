import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { PermissionDeleteInput, PermissionDeleteUsecase } from '../permission-delete';
import { RoleEntity } from '../../../role/entity/role';
import { RoleEnum } from '@pharma/utils/constants';
import { CreatedModel } from '@pharma/infra/repository';
import { IPermissionDeleteAdapter } from '@/services/permissions-service/src/adapters';
import { ApiConflictException, ApiNotFoundException } from '@pharma/utils/exception';
import { ZodExceptionIssue } from '@pharma/utils/validator';

import { IPermissionRepository } from '../../repository/permission';
import { PermissionEntity } from './../../entity/permission';

describe(PermissionDeleteUsecase.name, () => {
  let usecase: IPermissionDeleteAdapter;
  let repository: IPermissionRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: IPermissionRepository,
          useValue: {}
        },
        {
          provide: IPermissionDeleteAdapter,
          useFactory: (permissionRepository: IPermissionRepository) => {
            return new PermissionDeleteUsecase(permissionRepository);
          },
          inject: [IPermissionRepository]
        }
      ]
    }).compile();

    usecase = app.get(IPermissionDeleteAdapter);
    repository = app.get(IPermissionRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({} as PermissionDeleteInput),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([{ message: 'Required', path: TestMock.nameOf<PermissionDeleteInput>('id') }]);
      }
    );
  });

  const input: PermissionDeleteInput = {
    id: TestMock.getMockUUID()
  };

  test('when permission not found, should expect an error', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<PermissionEntity>(null);

    await expect(usecase.execute(input)).rejects.toThrow(ApiNotFoundException);
  });

  test('when permission has association with role, should expect an error', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<PermissionEntity>({
      roles: [{ name: RoleEnum.BACKOFFICE } as RoleEntity]
    });

    await expect(usecase.execute(input)).rejects.toThrow(ApiConflictException);
  });

  const permission = new PermissionEntity({
    id: TestMock.getMockUUID(),
    name: 'name:permission'
  });

  test('when permission deleted successfully, should expect a permission deleted', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<PermissionEntity>(permission);
    repository.create = TestMock.mockResolvedValue<CreatedModel>();

    await expect(usecase.execute(input)).resolves.toEqual({
      ...permission,
      deletedAt: expect.any(Date)
    });
  });
});
