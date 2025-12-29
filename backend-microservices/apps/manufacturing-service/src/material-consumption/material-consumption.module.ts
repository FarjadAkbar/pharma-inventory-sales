import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MaterialConsumptionController } from './material-consumption.controller';
import { MaterialConsumptionService } from './material-consumption.service';
import { MaterialConsumption } from '../entities/material-consumption.entity';
import { Batch } from '../entities/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaterialConsumption, Batch]),
    ClientsModule.register([
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST,
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3012'),
        },
      },
    ]),
  ],
  controllers: [MaterialConsumptionController],
  providers: [MaterialConsumptionService],
  exports: [MaterialConsumptionService],
})
export class MaterialConsumptionModule {}

