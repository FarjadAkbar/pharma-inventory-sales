import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QCResultsController } from './qc-results.controller';
import { QCResultsService } from './qc-results.service';
import { QCResult } from '../entities/qc-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QCResult]),
    ClientsModule.register([
      {
        name: 'QC_SAMPLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_SAMPLE_SERVICE_HOST,
          port: parseInt(process.env.QC_SAMPLE_SERVICE_PORT),
        },
      },
      {
        name: 'QC_TEST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_TEST_SERVICE_HOST,
          port: parseInt(process.env.QC_TEST_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [QCResultsController],
  providers: [QCResultsService],
})
export class QCResultsModule {}

