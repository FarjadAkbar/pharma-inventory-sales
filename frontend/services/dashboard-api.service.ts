import { BaseApiService } from './base-api.service'

export interface DashboardStat {
  title: string
  value: string
  description: string
  icon: string
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export interface StockAlert {
  name: string
  type: 'Low Stock' | 'Expiring' | 'Expired' | 'Out of Stock'
  severity: 'low' | 'medium' | 'high' | 'critical'
  quantity?: number
  minStock?: number
  expiryDate?: string
  itemId?: number
  itemCode?: string
}

export interface Notification {
  type: string
  message: string
  time: string
  link?: string
  read?: boolean
}

export interface Activity {
  action: string
  user: string
  timestamp: string
  details?: string
}

export interface DashboardStatsResponse {
  stats: DashboardStat[]
}

export interface StockAlertsResponse {
  alerts: StockAlert[]
}

export interface NotificationsResponse {
  notifications: Notification[]
}

export interface ActivitiesResponse {
  activities: Activity[]
}

class DashboardApiService extends BaseApiService {
  async getStats(): Promise<DashboardStatsResponse> {
    return this.get<DashboardStatsResponse>('/dashboard/stats')
  }

  async getAlerts(): Promise<StockAlertsResponse> {
    return this.get<StockAlertsResponse>('/dashboard/alerts')
  }

  async getNotifications(): Promise<NotificationsResponse> {
    return this.get<NotificationsResponse>('/dashboard/notifications')
  }

  async getActivities(): Promise<ActivitiesResponse> {
    return this.get<ActivitiesResponse>('/dashboard/activities')
  }
}

export const dashboardApiService = new DashboardApiService()
