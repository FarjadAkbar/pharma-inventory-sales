import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsModule } from './shipments/shipments.module';
import { ProofOfDeliveryModule } from './proof-of-delivery/proof-of-delivery.module';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ShipmentsModule,
    ProofOfDeliveryModule,
  ],
})
export class AppModule {}

