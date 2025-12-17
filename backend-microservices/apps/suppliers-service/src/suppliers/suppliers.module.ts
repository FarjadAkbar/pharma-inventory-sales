import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { Supplier } from '../entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    ClientsModule.register([
      {
        name: 'SITE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SITE_SERVICE_PORT || '3005'),
        },
      },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}

