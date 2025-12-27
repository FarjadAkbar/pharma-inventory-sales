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
        name: 'QUALITY_CONTROL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_CONTROL_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'),
        },
      },
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT || '3009'),
        },
      },
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST,
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3012'),
        },
      },
    ]),
  ],
  controllers: [QAReleasesController],
  providers: [QAReleasesService],
  exports: [QAReleasesService],
})
export class QAReleasesModule {}

