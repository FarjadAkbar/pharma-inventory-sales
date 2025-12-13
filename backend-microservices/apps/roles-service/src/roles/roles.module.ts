import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    ClientsModule.register([
      {
        name: 'PERMISSION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PERMISSION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PERMISSION_SERVICE_PORT || '3002'),
        },
      },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}

