import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { RoleEntity } from '@pharma/core/role/entity/role';
import { RoleEnum } from '@pharma/utils/constants';
import { IRoleRepository } from '@pharma/core/role/repository/role';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { EmitEventOutput, IEventAdapter } from '@pharma/libs/event';
import { IUserCreateAdapter } from '@/services/users-service/src/adapters';
import { ApiConflictException, ApiNotFoundException } from '@pharma/utils/exception';
import { ZodExceptionIssue } from '@pharma/utils/validator';

import { UserEntity } from '../../entity/user';
import { UserPasswordEntity } from '../../entity/user-password';
import { IUserRepository } from '../../repository/user';
import { UserCreateInput, UserCreateUsecase } from '../user-create';

describe(UserCreateUsecase.name, () => {
  let usecase: IUserCreateAdapter;
  let repository: IUserRepository;
  let roleRepository: IRoleRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: IRoleRepository,
          useValue: {}
        },
        {
          provide: IEventAdapter,
          useValue: {
            emit: TestMock.mockResolvedValue<EmitEventOutput>()
          }
        },
        {
          provide: IUserCreateAdapter,
          useFactory: (
            userRepository: IUserRepository,
            logger: ILoggerAdapter,
            event: IEventAdapter,
            roleRepository: IRoleRepository
          ) => {
            return new UserCreateUsecase(userRepository, logger, event, roleRepository);
          },
          inject: [IUserRepository, ILoggerAdapter, IEventAdapter, IRoleRepository]
        }
      ]
    }).compile();

    usecase = app.get(IUserCreateAdapter);
    repository = app.get(IUserRepository);
    roleRepository = app.get(IRoleRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({} as UserCreateInput, TestMock.getMockTracing()),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([
          { message: 'Required', path: TestMock.nameOf<UserCreateInput>('email') },
          { message: 'Required', path: TestMock.nameOf<UserCreateInput>('name') },
          { message: 'Required', path: TestMock.nameOf<UserCreateInput>('password') },
          { message: 'Required', path: TestMock.nameOf<UserCreateInput>('roles') }
        ]);
      }
    );
  });

  const input: UserCreateInput = {
    email: 'admin@admin.com',
    name: 'Admin',
    password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    roles: [RoleEnum.USER]
  };

  test('when role not found, should expect an error', async () => {
    roleRepository.findIn = TestMock.mockResolvedValue<RoleEntity[]>([]);

    await expect(usecase.execute(input, TestMock.getMockTracing())).rejects.toThrow(ApiNotFoundException);
  });

  const role = new RoleEntity({ id: TestMock.getMockUUID(), name: RoleEnum.USER });

  const user = new UserEntity({
    id: TestMock.getMockUUID(),
    email: 'admin@admin.com',
    name: 'Admin',
    roles: [new RoleEntity({ id: TestMock.getMockUUID(), name: RoleEnum.USER })],
    password: new UserPasswordEntity({
      id: TestMock.getMockUUID(),
      password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    })
  });

  test('when user already exists, should expect an error', async () => {
    roleRepository.findIn = TestMock.mockResolvedValue<RoleEntity[]>([role]);
    repository.findOne = TestMock.mockResolvedValue<UserEntity>(user);

    await expect(usecase.execute(input, TestMock.getMockTracing())).rejects.toThrow(ApiConflictException);
  });

  test('when user created successfully, should expect an user', async () => {
    roleRepository.findIn = TestMock.mockResolvedValue<RoleEntity[]>([role]);
    repository.findOne = TestMock.mockResolvedValue<UserEntity>(null);
    const createOutput = { created: true, id: TestMock.getMockUUID() };
    repository.create = TestMock.mockResolvedValue<CreatedModel>(createOutput);

    await expect(usecase.execute(input, TestMock.getMockTracing())).resolves.toEqual(createOutput);
  });
});
