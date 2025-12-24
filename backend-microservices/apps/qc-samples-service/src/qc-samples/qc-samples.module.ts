import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QCSamplesController } from './qc-samples.controller';
import { QCSamplesService } from './qc-samples.service';
import { QCSample } from '../entities/qc-sample.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QCSample]),
    ClientsModule.register([
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT || '3010'),
        },
      },
      {
        name: 'QC_TEST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_TEST_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QC_TEST_SERVICE_PORT || '3012'),
        },
      },
    ]),
  ],
  controllers: [QCSamplesController],
  providers: [QCSamplesService],
})
export class QCSamplesModule {}

