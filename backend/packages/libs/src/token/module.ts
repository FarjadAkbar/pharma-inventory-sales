import { Module } from '@nestjs/common';

import { ISecretsAdapter, SecretsModule } from '@pharma/infra';

import { ITokenAdapter } from './adapter';
import { TokenService } from './service';

@Module({
  imports: [SecretsModule],
  providers: [
    {
      provide: ITokenAdapter,
      useFactory: (secret: ISecretsAdapter) => new TokenService(secret),
      inject: [ISecretsAdapter]
    }
  ],
  exports: [ITokenAdapter]
})
export class TokenLibModule {}
