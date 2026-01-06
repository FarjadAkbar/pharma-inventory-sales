import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOMsController } from './boms.controller';
import { BOMsService } from './boms.service';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BOM, BOMItem])],
  controllers: [BOMsController],
  providers: [BOMsService],
  exports: [BOMsService],
})
export class BOMsModule {}

