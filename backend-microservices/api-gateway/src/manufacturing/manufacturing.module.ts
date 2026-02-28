import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WorkOrdersController } from './work-orders.controller';
import { BatchesController } from './batches.controller';
import { MaterialConsumptionController } from './material-consumption.controller';
import { BomsController } from './boms.controller';
import { EbrController } from './ebr.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MANUFACTURING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MANUFACTURING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MANUFACTURING_SERVICE_PORT || '3006', 10),
        },
      },
    ]),
  ],
  controllers: [
    WorkOrdersController,
    BatchesController,
    MaterialConsumptionController,
    BomsController,
    EbrController,
  ],
})
export class ManufacturingModule {}
