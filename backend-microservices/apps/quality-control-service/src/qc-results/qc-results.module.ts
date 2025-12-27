import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QCResultsController } from './qc-results.controller';
import { QCResultsService } from './qc-results.service';
import { QCResult } from '../entities/qc-result.entity';
import { QCTestsModule } from '../qc-tests/qc-tests.module'; // Import for direct service access
import { QCSamplesModule } from '../qc-samples/qc-samples.module'; // Import for direct service access

@Module({
  imports: [
    TypeOrmModule.forFeature([QCResult]),
    QCTestsModule, // Import to use QCTestsService directly
    QCSamplesModule, // Import to use QCSamplesService directly
  ],
  controllers: [QCResultsController],
  providers: [QCResultsService],
})
export class QCResultsModule {}

