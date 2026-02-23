import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Dashboard module: exposes aggregated dashboard data for the UI.
 * DashboardService (BFF) runs in the gateway and calls identity, master-data,
 * quality, warehouse, manufacturing, sales, shipment microservices.
 * Clients are registered at app level (app.module.ts).
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
