import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'ROLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROLE_SERVICE_HOST,
          port: parseInt(process.env.ROLE_SERVICE_PORT ?? '3003'),
        },
      },
      {
        name: 'SITE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITE_SERVICE_HOST,
          port: parseInt(process.env.SITE_SERVICE_PORT ?? '3005'),
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
