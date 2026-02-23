import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QADeviationsController } from './qa-deviations.controller';
import { QADeviationsService } from './qa-deviations.service';
import { QADeviation } from '../entities/qa-deviation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QADeviation]),
  ],
  controllers: [QADeviationsController],
  providers: [QADeviationsService],
  exports: [QADeviationsService],
})
export class QADeviationsModule {}

