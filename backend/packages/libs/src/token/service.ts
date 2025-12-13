import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { ISecretsAdapter } from '@pharma/infra';
import { ApiUnauthorizedException } from '@pharma/utils/exception';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { ITokenAdapter } from './adapter';

// Define token schema directly to avoid circular dependency with @pharma/core
// This matches the structure needed for token generation
const RoleSchema = InputValidator.object({
  id: InputValidator.string().uuid(),
  name: InputValidator.string()
}).optional();

export const TokenGetSchema = InputValidator.object({
  email: InputValidator.string().email(),
  roles: InputValidator.array(RoleSchema).min(1),
  password: InputValidator.string()
});

@Injectable()
export class TokenService implements ITokenAdapter {
  constructor(private readonly secret: ISecretsAdapter) {}

  sign<TOpt = jwt.SignOptions>(model: SignInput, options?: TOpt): SignOutput {
    const token = jwt.sign(
      model,
      this.secret.JWT_SECRET_KEY,
      options || {
        expiresIn: this.secret.TOKEN_EXPIRATION as jwt.SignOptions['expiresIn']
      }
    );

    return { token };
  }

  async verify<T>(token: string): Promise<T> {
    return new Promise((res, rej) => {
      jwt.verify(token, this.secret.JWT_SECRET_KEY, (error, decoded) => {
        if (error) rej(new ApiUnauthorizedException(error.message));

        res(decoded as T);
      });
    });
  }
}

export type SignInput = Infer<typeof TokenGetSchema>;

export type SignOutput = {
  token: string;
};
