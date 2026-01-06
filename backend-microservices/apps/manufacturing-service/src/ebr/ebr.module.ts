import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EBRController } from './ebr.controller';
import { EBRService } from './ebr.service';
import { Batch } from '../entities/batch.entity';
import { BatchStep } from '../entities/batch-step.entity';
import { MaterialConsumption } from '../entities/material-consumption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, BatchStep, MaterialConsumption])],
  controllers: [EBRController],
  providers: [EBRService],
  exports: [EBRService],
})
export class EBRModule {}

