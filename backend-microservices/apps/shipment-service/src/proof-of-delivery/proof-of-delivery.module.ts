import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProofOfDeliveryController } from './proof-of-delivery.controller';
import { ProofOfDeliveryService } from './proof-of-delivery.service';
import { ProofOfDelivery, Shipment } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProofOfDelivery, Shipment]),
  ],
  controllers: [ProofOfDeliveryController],
  providers: [ProofOfDeliveryService],
  exports: [ProofOfDeliveryService],
})
export class ProofOfDeliveryModule {}

