import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { RoleEntity } from '@pharma/core/role/entity/role';
import { RoleEnum } from '@pharma/utils/constants';
import { IUserDeleteAdapter } from '@/services/users-service/src/adapters';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ZodExceptionIssue } from '@pharma/utils/validator';

import { UserEntity } from '../../entity/user';
import { IUserRepository } from '../../repository/user';
import { UserDeleteInput, UserDeleteUsecase } from '../user-delete';

describe(UserDeleteUsecase.name, () => {
  let usecase: IUserDeleteAdapter;
  let repository: IUserRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: IUserDeleteAdapter,
          useFactory: (userRepository: IUserRepository) => {
            return new UserDeleteUsecase(userRepository);
          },
          inject: [IUserRepository]
        }
      ]
    }).compile();

    usecase = app.get(IUserDeleteAdapter);
    repository = app.get(IUserRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({ id: 'uuid' } as UserDeleteInput, TestMock.getMockTracing()),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([{ message: 'Invalid uuid', path: TestMock.nameOf<UserDeleteInput>('id') }]);
      }
    );
  });

  test('when user not found, should expect an error', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(null);

    await expect(usecase.execute({ id: TestMock.getMockUUID() }, TestMock.getMockTracing())).rejects.toThrow(
      ApiNotFoundException
    );
  });

  const user = new UserEntity({
    id: TestMock.getMockUUID(),
    email: 'admin@admin.com',
    name: '*Admin',
    roles: [new RoleEntity({ id: TestMock.getMockUUID(), name: RoleEnum.USER })],
    password: { id: TestMock.getMockUUID(), password: '****' }
  });

  test('when user deleted successfully, should expect an user deleted.', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(user);
    repository.softRemove = TestMock.mockResolvedValue<UserEntity>();

    await expect(usecase.execute({ id: TestMock.getMockUUID() }, TestMock.getMockTracing())).resolves.toEqual(
      expect.any(UserEntity)
    );
    expect(repository.softRemove).toHaveBeenCalled();
  });
});
