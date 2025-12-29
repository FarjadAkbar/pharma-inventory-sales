import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchStepsController } from './batch-steps.controller';
import { BatchStepsService } from './batch-steps.service';
import { BatchStep } from '../entities/batch-step.entity';
import { Batch } from '../entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatchStep, Batch])],
  controllers: [BatchStepsController],
  providers: [BatchStepsService],
  exports: [BatchStepsService],
})
export class BatchStepsModule {}

