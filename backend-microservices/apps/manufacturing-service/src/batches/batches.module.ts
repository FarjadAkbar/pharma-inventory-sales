import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { Batch } from '../entities/batch.entity';
import { WorkOrder } from '../entities/work-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, WorkOrder]),
    ClientsModule.register([
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST,
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3012'),
        },
      },
      {
        name: 'QUALITY_CONTROL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_CONTROL_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'),
        },
      },
    ]),
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}

