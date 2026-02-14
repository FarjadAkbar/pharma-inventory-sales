import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DashboardStatsResponseDto,
  DashboardStatDto,
  StockAlertsResponseDto,
  StockAlertDto,
  StockAlertType,
  AlertSeverity,
  NotificationsResponseDto,
  NotificationDto,
  ActivitiesResponseDto,
  ActivityDto,
  WAREHOUSE_PATTERNS,
  DRUG_PATTERNS,
  SALES_ORDER_PATTERNS,
  MANUFACTURING_PATTERNS,
  QC_PATTERNS,
  QA_PATTERNS,
  SHIPMENT_PATTERNS,
  USER_PATTERNS,
} from '@repo/shared';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('WAREHOUSE_SERVICE') private warehouseClient: ClientProxy,
    @Inject('DRUGS_SERVICE') private drugsClient: ClientProxy,
    @Inject('SALES_ORDER_SERVICE') private salesOrderClient: ClientProxy,
    @Inject('MANUFACTURING_SERVICE') private manufacturingClient: ClientProxy,
    @Inject('QUALITY_CONTROL_SERVICE') private qcClient: ClientProxy,
    @Inject('QUALITY_ASSURANCE_SERVICE') private qaClient: ClientProxy,
    @Inject('SHIPMENT_SERVICE') private shipmentClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  async getStats(user: any): Promise<DashboardStatsResponseDto> {
    const stats: DashboardStatDto[] = [];

    try {
      // Base stats for all roles
      const activeUsersCount = await this.getActiveUsersCount();
      stats.push({
        title: 'Active Users',
        value: activeUsersCount.toString(),
        description: 'Currently online',
        icon: 'Users',
        trend: { value: 5, isPositive: true },
        color: 'text-blue-600',
      });

      // Role-specific stats
      switch (user.role) {
        case 'system_admin':
        case 'org_admin':
          await this.addAdminStats(stats);
          break;
        case 'procurement_manager':
          await this.addProcurementStats(stats);
          break;
        case 'production_manager':
          await this.addProductionStats(stats);
          break;
        case 'qc_manager':
          await this.addQCStats(stats);
          break;
        case 'qa_manager':
          await this.addQAStats(stats);
          break;
        case 'warehouse_ops':
          await this.addWarehouseStats(stats);
          break;
        case 'distribution_ops':
          await this.addDistributionStats(stats);
          break;
        case 'sales_rep':
          await this.addSalesStats(stats);
          break;
        default:
          await this.addDefaultStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats on error
      return { stats: this.getDefaultStats() };
    }

    return { stats };
  }

  async getAlerts(user: any): Promise<StockAlertsResponseDto> {
    const alerts: StockAlertDto[] = [];

    try {
      // Get low stock items from warehouse
      const lowStockItems = await firstValueFrom(
        this.warehouseClient.send(WAREHOUSE_PATTERNS.LIST_LOW_STOCK, {})
      ).catch(() => []);

      for (const item of lowStockItems.slice(0, 10)) {
        alerts.push({
          name: item.name || item.code,
          type: StockAlertType.LOW_STOCK,
          severity: item.quantity === 0 ? AlertSeverity.CRITICAL : item.quantity < 10 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          quantity: item.quantity,
          minStock: item.minStock || 50,
          itemId: item.id,
          itemCode: item.code,
        });
      }

      // Get expiring drugs
      const expiringDrugs = await firstValueFrom(
        this.drugsClient.send(DRUG_PATTERNS.LIST_EXPIRING, { days: 30 })
      ).catch(() => []);

      for (const drug of expiringDrugs.slice(0, 10)) {
        alerts.push({
          name: drug.name,
          type: StockAlertType.EXPIRING,
          severity: this.getExpirySeverity(drug.expiryDate),
          expiryDate: drug.expiryDate,
          itemId: drug.id,
          itemCode: drug.code,
        });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }

    return { alerts };
  }

  async getNotifications(user: any): Promise<NotificationsResponseDto> {
    const notifications: NotificationDto[] = [];

    try {
      // For now, return sample notifications
      // TODO: Implement actual notification system
      notifications.push(
        {
          type: 'System',
          message: 'Dashboard data is now live!',
          time: 'Just now',
          read: false,
        }
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

    return { notifications };
  }

  async getActivities(user: any): Promise<ActivitiesResponseDto> {
    const activities: ActivityDto[] = [];

    try {
      // For now, return sample activities
      // TODO: Implement actual activity tracking
      activities.push(
        {
          action: 'User logged in',
          user: user.name,
          timestamp: new Date().toISOString(),
          details: 'Dashboard accessed',
        }
      );
    } catch (error) {
      console.error('Error fetching activities:', error);
    }

    return { activities };
  }

  // Helper methods
  private async getActiveUsersCount(): Promise<number> {
    try {
      const result = await firstValueFrom(
        this.userClient.send(USER_PATTERNS.COUNT_ACTIVE, {})
      );
      return result?.count || 0;
    } catch {
      return 0;
    }
  }

  private async addAdminStats(stats: DashboardStatDto[]) {
    stats.push({
      title: 'System Health',
      value: '98.5%',
      description: 'System uptime',
      icon: 'AlertTriangle',
      trend: { value: 2, isPositive: true },
      color: 'text-green-600',
    });
  }

  private async addProcurementStats(stats: DashboardStatDto[]) {
    // TODO: Fetch real procurement stats
    stats.push({
      title: 'Pending POs',
      value: '0',
      description: 'Awaiting approval',
      icon: 'ShoppingCart',
      color: 'text-orange-600',
    });
  }

  private async addProductionStats(stats: DashboardStatDto[]) {
    try {
      const batches = await firstValueFrom(
        this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_LIST, { status: 'IN_PROGRESS' })
      );
      stats.push({
        title: 'Active Batches',
        value: batches?.batches?.length?.toString() || '0',
        description: 'In production',
        icon: 'Factory',
        color: 'text-blue-600',
      });
    } catch {
      stats.push({
        title: 'Active Batches',
        value: '0',
        description: 'In production',
        icon: 'Factory',
        color: 'text-blue-600',
      });
    }
  }

  private async addQCStats(stats: DashboardStatDto[]) {
    try {
      const samples = await firstValueFrom(
        this.qcClient.send(QC_PATTERNS.SAMPLE_LIST, { status: 'PENDING' })
      );
      stats.push({
        title: 'Sample Queue',
        value: samples?.samples?.length?.toString() || '0',
        description: 'Awaiting testing',
        icon: 'TestTube',
        color: 'text-yellow-600',
      });
    } catch {
      stats.push({
        title: 'Sample Queue',
        value: '0',
        description: 'Awaiting testing',
        icon: 'TestTube',
        color: 'text-yellow-600',
      });
    }
  }

  private async addQAStats(stats: DashboardStatDto[]) {
    stats.push({
      title: 'Pending Releases',
      value: '0',
      description: 'Awaiting QA review',
      icon: 'Shield',
      color: 'text-orange-600',
    });
  }

  private async addWarehouseStats(stats: DashboardStatDto[]) {
    stats.push({
      title: 'Stock Levels',
      value: '0',
      description: 'Total SKUs',
      icon: 'Package',
      color: 'text-blue-600',
    });
  }

  private async addDistributionStats(stats: DashboardStatDto[]) {
    try {
      const shipments = await firstValueFrom(
        this.shipmentClient.send(SHIPMENT_PATTERNS.LIST, { status: 'IN_TRANSIT' })
      );
      stats.push({
        title: 'Shipment Status',
        value: shipments?.shipments?.length?.toString() || '0',
        description: 'In transit',
        icon: 'Truck',
        color: 'text-blue-600',
      });
    } catch {
      stats.push({
        title: 'Shipment Status',
        value: '0',
        description: 'In transit',
        icon: 'Truck',
        color: 'text-blue-600',
      });
    }
  }

  private async addSalesStats(stats: DashboardStatDto[]) {
    stats.push({
      title: 'Order Pipeline',
      value: '0',
      description: 'Pending orders',
      icon: 'TrendingUp',
      color: 'text-green-600',
    });
  }

  private async addDefaultStats(stats: DashboardStatDto[]) {
    stats.push({
      title: 'Daily Sales',
      value: '$0',
      description: "Today's revenue",
      icon: 'DollarSign',
      color: 'text-green-600',
    });
  }

  private getDefaultStats(): DashboardStatDto[] {
    return [
      {
        title: 'System Status',
        value: 'Online',
        description: 'All systems operational',
        icon: 'CheckCircle',
        color: 'text-green-600',
      },
    ];
  }

  private getExpirySeverity(expiryDate: string): AlertSeverity {
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) return AlertSeverity.CRITICAL;
    if (daysUntilExpiry < 7) return AlertSeverity.HIGH;
    if (daysUntilExpiry < 30) return AlertSeverity.MEDIUM;
    return AlertSeverity.LOW;
  }
}
