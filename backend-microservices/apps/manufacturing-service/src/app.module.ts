import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { BatchesModule } from './batches/batches.module';
import { BatchStepsModule } from './batch-steps/batch-steps.module';
import { MaterialConsumptionModule } from './material-consumption/material-consumption.module';
import { BOMsModule } from './boms/boms.module';
import { EBRModule } from './ebr/ebr.module';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    WorkOrdersModule,
    BatchesModule,
    BatchStepsModule,
    MaterialConsumptionModule,
    BOMsModule,
    EBRModule,
  ],
})
export class AppModule {}

