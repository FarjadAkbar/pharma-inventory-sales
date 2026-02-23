import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QCSamplesController } from './qc-samples.controller';
import { QCSamplesService } from './qc-samples.service';
import { QCSample } from '../entities/qc-sample.entity';
import { QCTestsModule } from '../qc-tests/qc-tests.module'; // Import for direct service access

@Module({
  imports: [
    TypeOrmModule.forFeature([QCSample]),
    QCTestsModule, // Import to use QCTestsService directly
    ClientsModule.register([
      {
        name: 'PROCUREMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PROCUREMENT_SERVICE_HOST,
          port: parseInt(process.env.PROCUREMENT_SERVICE_PORT || '3011'),
        },
      },
    ]),
  ],
  controllers: [QCSamplesController],
  providers: [QCSamplesService],
  exports: [QCSamplesService], // Export for internal use
})
export class QCSamplesModule {}

