import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { 
  InventoryItem, 
  StockMovement, 
  PutawayItem, 
  MaterialIssue,
  Warehouse,
  StorageLocation,
  CycleCount,
  TemperatureLog,
  LabelBarcode,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem, 
      StockMovement, 
      PutawayItem, 
      MaterialIssue,
      Warehouse,
      StorageLocation,
      CycleCount,
      TemperatureLog,
      LabelBarcode,
    ]),
    ClientsModule.register([
      {
        name: 'QUALITY_ASSURANCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_ASSURANCE_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_ASSURANCE_SERVICE_PORT || '3011'),
        },
      },
    ]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}

