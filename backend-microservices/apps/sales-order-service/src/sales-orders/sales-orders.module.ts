import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrder } from '../entities/sales-order.entity';
import { SalesOrderItem } from '../entities/sales-order-item.entity';
import { AuditLog, AuditService, AuditSubscriber, StatusHistory } from '@repo/shared';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, SalesOrderItem, AuditLog, StatusHistory])],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, AuditService, AuditSubscriber],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}

