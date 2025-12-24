import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QAReleasesController } from './qa-releases.controller';
import { QAReleasesService } from './qa-releases.service';
import { QARelease } from '../entities/qa-release.entity';
import { QAChecklistItem } from '../entities/qa-checklist-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QARelease, QAChecklistItem]),
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
        name: 'QC_RESULT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_RESULT_SERVICE_HOST,
          port: parseInt(process.env.QC_RESULT_SERVICE_PORT),
        },
      },
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [QAReleasesController],
  providers: [QAReleasesService],
})
export class QAReleasesModule {}

