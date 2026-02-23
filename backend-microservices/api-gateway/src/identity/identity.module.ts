import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';

@Module({
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
  ],
})
export class IdentityModule {}
