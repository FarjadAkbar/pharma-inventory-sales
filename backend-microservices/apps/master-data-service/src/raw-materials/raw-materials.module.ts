import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialsController } from './raw-materials.controller';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterial } from '../entities/raw-material.entity';
import { Supplier } from '../entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterial, Supplier])],
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService],
  exports: [RawMaterialsService],
})
export class RawMaterialsModule {}
