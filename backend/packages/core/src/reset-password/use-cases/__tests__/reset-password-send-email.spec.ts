import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { RoleEntity } from '@pharma/core/role/entity/role';
import { RoleEnum } from '@pharma/utils/constants';
import { UserEntity } from '@pharma/core/user/entity/user';
import { IUserRepository } from '@pharma/core/user/repository/user';
import { CreatedModel } from '@pharma/infra/repository';
import { ISecretsAdapter } from '@pharma/infra/secrets';
import { EmitEventOutput, IEventAdapter } from '@pharma/libs/event';
import { ITokenAdapter, SignOutput } from '@pharma/libs/token';
import { IConfirmResetPasswordAdapter, ISendEmailResetPasswordAdapter } from '@/services/auth-service/src/adapters';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ZodExceptionIssue } from '@pharma/utils/validator';

import { ResetPasswordEntity } from '../../entity/reset-password';
import { IResetPasswordRepository } from '../../repository/reset-password';
import { ResetPasswordSendEmailInput, ResetPasswordSendEmailUsecase } from '../reset-password-send-email';

describe(ResetPasswordSendEmailUsecase.name, () => {
  let usecase: ISendEmailResetPasswordAdapter;
  let repository: IResetPasswordRepository;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: ISecretsAdapter,
          useValue: {
            HOST: 'localhost'
          }
        },
        {
          provide: IResetPasswordRepository,
          useValue: {}
        },
        {
          provide: ITokenAdapter,
          useValue: {
            sign: TestMock.mockReturnValue<SignOutput>({ token: 'token' })
          }
        },
        {
          provide: IEventAdapter,
          useValue: {
            emit: TestMock.mockResolvedValue<EmitEventOutput>()
          }
        },
        {
          provide: IConfirmResetPasswordAdapter,
          useFactory: (
            repository: IResetPasswordRepository,
            userRepository: IUserRepository,
            token: ITokenAdapter,
            event: IEventAdapter,
            secret: ISecretsAdapter
          ) => {
            return new ResetPasswordSendEmailUsecase(repository, userRepository, token, event, secret);
          },
          inject: [IResetPasswordRepository, IUserRepository, ITokenAdapter, IEventAdapter, ISecretsAdapter]
        }
      ]
    }).compile();

    usecase = app.get(IConfirmResetPasswordAdapter);
    repository = app.get(IResetPasswordRepository);
    userRepository = app.get(IUserRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({} as ResetPasswordSendEmailInput),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([{ message: 'Required', path: TestMock.nameOf<ResetPasswordSendEmailInput>('email') }]);
      }
    );
  });

  const input: ResetPasswordSendEmailInput = { email: 'admin@admin.com' };

  test('when user not found, should expect an error', async () => {
    userRepository.findOne = TestMock.mockResolvedValue<UserEntity>(null);

    await expect(usecase.execute(input)).rejects.toThrow(ApiNotFoundException);
  });

  const user = new UserEntity({
    id: TestMock.getMockUUID(),
    email: 'admin@admin.com',
    name: 'Admin',
    roles: [new RoleEntity({ id: TestMock.getMockUUID(), name: RoleEnum.USER })]
  });

  const resetPassword = new ResetPasswordEntity({ id: TestMock.getMockUUID(), token: 'token', user });

  test('when token was founded, should expect void', async () => {
    userRepository.findOne = TestMock.mockResolvedValue<UserEntity>(user);
    repository.findByIdUserId = TestMock.mockResolvedValue<ResetPasswordEntity>(resetPassword);

    await expect(usecase.execute(input)).resolves.toBeUndefined();
  });

  test('when token was not founded, should expect void', async () => {
    userRepository.findOne = TestMock.mockResolvedValue<UserEntity>(user);
    repository.findByIdUserId = TestMock.mockResolvedValue<ResetPasswordEntity>(null);
    repository.create = TestMock.mockResolvedValue<CreatedModel>();

    await expect(usecase.execute(input)).resolves.toBeUndefined();
  });
});
