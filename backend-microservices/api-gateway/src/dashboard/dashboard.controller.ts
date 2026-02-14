import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  DashboardStatsResponseDto,
  StockAlertsResponseDto,
  NotificationsResponseDto,
  ActivitiesResponseDto,
} from '@repo/shared';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@CurrentUser() user: any): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getStats(user);
  }

  @Get('alerts')
  async getAlerts(@CurrentUser() user: any): Promise<StockAlertsResponseDto> {
    return this.dashboardService.getAlerts(user);
  }

  @Get('notifications')
  async getNotifications(@CurrentUser() user: any): Promise<NotificationsResponseDto> {
    return this.dashboardService.getNotifications(user);
  }

  @Get('activities')
  async getActivities(@CurrentUser() user: any): Promise<ActivitiesResponseDto> {
    return this.dashboardService.getActivities(user);
  }
}
