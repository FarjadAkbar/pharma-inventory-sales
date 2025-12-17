import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RawMaterialsController } from './raw-materials.controller';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterial } from '../entities/raw-material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RawMaterial]),
    ClientsModule.register([
      {
        name: 'SUPPLIER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SUPPLIER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SUPPLIER_SERVICE_PORT || '3006'),
        },
      },
    ]),
  ],
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService],
})
export class RawMaterialsModule {}

