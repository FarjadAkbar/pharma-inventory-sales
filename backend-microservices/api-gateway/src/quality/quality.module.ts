import { Module } from '@nestjs/common';
import { QCSamplesController } from './qc-samples.controller';
import { QCTestsController } from './qc-tests.controller';
import { QCResultsController } from './qc-results.controller';
import { QAReleasesController } from './qa-releases.controller';
import { QADeviationsController } from './qa-deviations.controller';

@Module({
  controllers: [
    QCSamplesController,
    QCTestsController,
    QCResultsController,
    QAReleasesController,
    QADeviationsController,
  ],
})
export class QualityModule {}
