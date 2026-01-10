import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSController } from './pos.controller';
import { POSService } from './pos.service';
import { POSTransaction } from '../entities/pos-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([POSTransaction])],
  controllers: [POSController],
  providers: [POSService],
  exports: [POSService],
})
export class POSModule {}
