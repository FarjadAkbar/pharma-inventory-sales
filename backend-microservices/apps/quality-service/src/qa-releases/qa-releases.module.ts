import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QAReleasesController } from './qa-releases.controller';
import { QAReleasesService } from './qa-releases.service';
import { QARelease } from '../entities/qa-release.entity';
import { QAChecklistItem } from '../entities/qa-checklist-item.entity';
import { QCSamplesModule } from '../qc-samples/qc-samples.module';
import { QCResultsModule } from '../qc-results/qc-results.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QARelease, QAChecklistItem]),
    QCSamplesModule,
    QCResultsModule,
    ClientsModule.register([
      { name: 'PROCUREMENT_SERVICE', transport: Transport.TCP, options: { host: process.env.PROCUREMENT_SERVICE_HOST, port: parseInt(process.env.PROCUREMENT_SERVICE_PORT || '3011') } },
      { name: 'WAREHOUSE_SERVICE', transport: Transport.TCP, options: { host: process.env.WAREHOUSE_SERVICE_HOST, port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3012') } },
    ]),
  ],
  controllers: [QAReleasesController],
  providers: [QAReleasesService],
  exports: [QAReleasesService],
})
export class QAReleasesModule {}

