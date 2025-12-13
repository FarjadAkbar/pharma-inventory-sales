import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { RolesController } from './roles/roles.controller';
import { PermissionsController } from './permissions/permissions.controller';
import { SitesController } from './sites/sites.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST,
          port: parseInt(process.env.USER_SERVICE_PORT),
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST,
          port: parseInt(process.env.AUTH_SERVICE_PORT),
        },
      },
      {
        name: 'ROLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROLE_SERVICE_HOST,
          port: parseInt(process.env.ROLE_SERVICE_PORT),
        },
      },
      {
        name: 'PERMISSION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PERMISSION_SERVICE_HOST,
          port: parseInt(process.env.PERMISSION_SERVICE_PORT),
        },
      },
      {
        name: 'SITE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITE_SERVICE_HOST,
          port: parseInt(process.env.SITE_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [
    UsersController,
    AuthController,
    RolesController,
    PermissionsController,
    SitesController,
  ],
})
export class AppModule {}
