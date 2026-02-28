import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QCSamplesController } from './qc-samples.controller';
import { QCTestsController } from './qc-tests.controller';
import { QCResultsController } from './qc-results.controller';
import { QAReleasesController } from './qa-releases.controller';
import { QADeviationsController } from './qa-deviations.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'QUALITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QUALITY_SERVICE_PORT || '3003'),
        },
      },
    ]),
  ],
  controllers: [
    QCSamplesController,
    QCTestsController,
    QCResultsController,
    QAReleasesController,
    QADeviationsController,
  ],
})
export class QualityModule {}
