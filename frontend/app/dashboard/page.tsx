"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth.context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Plus,
  Bell,
  Clock,
  RefreshCw,
  Users,
  Building2,
  Factory,
  TestTube,
  CheckCircle,
  Shield,
  ClipboardCheck,
  Truck,
  Loader2,
} from "lucide-react"
import { dashboardApiService, type DashboardStat, type StockAlert, type Notification } from "@/services/dashboard-api.service"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsData, alertsData, notificationsData] = await Promise.all([
        dashboardApiService.getStats(),
        dashboardApiService.getAlerts(),
        dashboardApiService.getNotifications(),
      ])

      setStats(statsData.stats)
      setAlerts(alertsData.alerts)
      setNotifications(notificationsData.notifications)
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
      // Set default/fallback data
      setStats(getDefaultStats())
      setAlerts([])
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const getDefaultStats = (): DashboardStat[] => {
    return [
      {
        title: "System Status",
        value: "Online",
        description: "All systems operational",
        icon: "CheckCircle",
        color: "text-green-600",
      },
    ]
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      DollarSign,
      TrendingUp,
      AlertTriangle,
      Calendar,
      Users,
      Building2,
      Factory,
      TestTube,
      CheckCircle,
      Shield,
      ClipboardCheck,
      Truck,
      ShoppingCart,
      Package,
    }
    return icons[iconName] || AlertTriangle
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" suppressHydrationWarning>
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's what's happening with your pharma inventory sales system.
            </p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard 
                key={index} 
                {...stat} 
                icon={getIconComponent(stat.icon)}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No alerts at this time
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.type === "Low Stock"
                            ? `${alert.quantity} left (Min: ${alert.minStock})`
                            : `Expires: ${alert.expiryDate}`}
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.severity === "high" || alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {alert.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notifications
              </CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No notifications
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks for efficient workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm font-medium">New Sale</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                  <Package className="h-6 w-6" />
                  <span className="text-sm font-medium">New Purchase</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Product</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                  <RefreshCw className="h-6 w-6" />
                  <span className="text-sm font-medium">Stock Update</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  )
}
