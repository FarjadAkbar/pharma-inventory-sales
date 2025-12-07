import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { PermissionEntity } from '@pharma/core/permission/entity/permission';
import { CreatedModel } from '@pharma/infra/repository';
import { IRoleDeleteAdapter } from '@/services/roles-service/src/adapters';
import { ApiConflictException, ApiNotFoundException } from '@pharma/utils/exception';
import { ZodExceptionIssue } from '@pharma/utils/validator';

import { RoleDeleteInput, RoleDeleteUsecase } from '../role-delete';

import { IRoleRepository } from '../../repository/role';
import { RoleEntity } from './../../entity/role';
import { RoleEnum } from '@pharma/utils/constants';

describe(RoleDeleteUsecase.name, () => {
  let usecase: IRoleDeleteAdapter;
  let repository: IRoleRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: IRoleRepository,
          useValue: {}
        },
        {
          provide: IRoleDeleteAdapter,
          useFactory: (roleRepository: IRoleRepository) => {
            return new RoleDeleteUsecase(roleRepository);
          },
          inject: [IRoleRepository]
        }
      ]
    }).compile();

    usecase = app.get(IRoleDeleteAdapter);
    repository = app.get(IRoleRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({} as RoleDeleteInput),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([{ message: 'Required', path: TestMock.nameOf<RoleDeleteInput>('id') }]);
      }
    );
  });

  const input: RoleDeleteInput = {
    id: TestMock.getMockUUID()
  };

  test('when role not found, should expect an error', async () => {
    repository.findById = TestMock.mockResolvedValue<RoleEntity>(null);

    await expect(usecase.execute(input)).rejects.toThrow(ApiNotFoundException);
  });

  test('when role has association with permission, should expect an error', async () => {
    repository.findById = TestMock.mockResolvedValue<RoleEntity>({
      permissions: [{ name: 'create:cat' } as PermissionEntity]
    });

    await expect(usecase.execute(input)).rejects.toThrow(ApiConflictException);
  });

  const role = new RoleEntity({
    id: TestMock.getMockUUID(),
    name: RoleEnum.USER
  });

  test('when role deleted successfully, should expect a role deleted', async () => {
    repository.findById = TestMock.mockResolvedValue<RoleEntity>(role);
    repository.create = TestMock.mockResolvedValue<CreatedModel>();

    await expect(usecase.execute(input)).resolves.toEqual({
      ...role,
      deletedAt: expect.any(Date)
    });
  });
});
