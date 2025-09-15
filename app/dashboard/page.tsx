"use client"

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
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Daily Sales",
      value: "$2,847",
      description: "Today's revenue",
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Monthly Sales",
      value: "$45,231",
      description: "This month's revenue",
      icon: TrendingUp,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Low Stock Items",
      value: "23",
      description: "Items below minimum stock",
      icon: AlertTriangle,
      trend: { value: 5, isPositive: false },
    },
    {
      title: "Expiring Soon",
      value: "12",
      description: "Items expiring in 30 days",
      icon: Calendar,
      trend: { value: 3, isPositive: false },
    },
  ]

  const stockAlerts = [
    { name: "Paracetamol 500mg", type: "Low Stock", quantity: 15, minStock: 50, severity: "high" },
    { name: "Amoxicillin 250mg", type: "Expiring", expiryDate: "2024-02-15", severity: "medium" },
    { name: "Ibuprofen 400mg", type: "Low Stock", quantity: 8, minStock: 30, severity: "high" },
    { name: "Vitamin D3", type: "Expiring", expiryDate: "2024-02-20", severity: "low" },
  ]

  const notifications = [
    { type: "Pending Order", message: "Order #PO-2024-001 awaiting approval", time: "2 hours ago" },
    { type: "Return Request", message: "Return request for Order #SO-2024-045", time: "4 hours ago" },
    { type: "Low Stock", message: "Paracetamol 500mg is running low", time: "6 hours ago" },
    { type: "Payment Due", message: "Invoice #INV-2024-123 payment overdue", time: "1 day ago" },
  ]

  // Get role-based dashboard cards
  const getRoleBasedCards = () => {
    const baseCards = [
      {
        title: "System Health",
        value: "98.5%",
        description: "System uptime",
        icon: AlertTriangle,
        trend: { value: 2, isPositive: true },
        color: "text-green-600"
      },
      {
        title: "Active Users",
        value: "24",
        description: "Currently online",
        icon: Users,
        trend: { value: 5, isPositive: true },
        color: "text-blue-600"
      }
    ]

    switch (user?.role) {
      case "system_admin":
        return [
          ...baseCards,
          {
            title: "User Activity",
            value: "156",
            description: "Active sessions today",
            icon: Users,
            trend: { value: 12, isPositive: true },
            color: "text-purple-600"
          },
          {
            title: "Audit Logs",
            value: "2,847",
            description: "Events logged today",
            icon: AlertTriangle,
            trend: { value: 8, isPositive: false },
            color: "text-orange-600"
          }
        ]
      case "org_admin":
        return [
          ...baseCards,
          {
            title: "Organization Metrics",
            value: "4",
            description: "Active sites",
            icon: Building2,
            trend: { value: 0, isPositive: true },
            color: "text-indigo-600"
          },
          {
            title: "User Management",
            value: "89",
            description: "Total users",
            icon: Users,
            trend: { value: 3, isPositive: true },
            color: "text-green-600"
          }
        ]
      case "procurement_manager":
        return [
          ...baseCards,
          {
            title: "Pending POs",
            value: "12",
            description: "Awaiting approval",
            icon: ShoppingCart,
            trend: { value: 3, isPositive: false },
            color: "text-orange-600"
          },
          {
            title: "Supplier Performance",
            value: "94.2%",
            description: "On-time delivery",
            icon: TrendingUp,
            trend: { value: 2, isPositive: true },
            color: "text-green-600"
          }
        ]
      case "production_manager":
        return [
          ...baseCards,
          {
            title: "Active Batches",
            value: "8",
            description: "In production",
            icon: Factory,
            trend: { value: 1, isPositive: true },
            color: "text-blue-600"
          },
          {
            title: "Work Orders",
            value: "15",
            description: "Scheduled today",
            icon: Calendar,
            trend: { value: 4, isPositive: true },
            color: "text-indigo-600"
          }
        ]
      case "qc_manager":
        return [
          ...baseCards,
          {
            title: "Sample Queue",
            value: "23",
            description: "Awaiting testing",
            icon: TestTube,
            trend: { value: 5, isPositive: false },
            color: "text-yellow-600"
          },
          {
            title: "Test Results",
            value: "156",
            description: "Completed today",
            icon: CheckCircle,
            trend: { value: 12, isPositive: true },
            color: "text-green-600"
          }
        ]
      case "qa_manager":
        return [
          ...baseCards,
          {
            title: "Pending Releases",
            value: "7",
            description: "Awaiting QA review",
            icon: Shield,
            trend: { value: 2, isPositive: false },
            color: "text-orange-600"
          },
          {
            title: "Deviations",
            value: "3",
            description: "Open investigations",
            icon: AlertTriangle,
            trend: { value: 1, isPositive: false },
            color: "text-red-600"
          }
        ]
      case "warehouse_ops":
        return [
          ...baseCards,
          {
            title: "Stock Levels",
            value: "2,847",
            description: "Total SKUs",
            icon: Package,
            trend: { value: 15, isPositive: true },
            color: "text-blue-600"
          },
          {
            title: "Putaway Queue",
            value: "45",
            description: "Items pending storage",
            icon: ClipboardCheck,
            trend: { value: 8, isPositive: false },
            color: "text-orange-600"
          }
        ]
      case "distribution_ops":
        return [
          ...baseCards,
          {
            title: "Shipment Status",
            value: "18",
            description: "In transit",
            icon: Truck,
            trend: { value: 3, isPositive: true },
            color: "text-blue-600"
          },
          {
            title: "Cold Chain Alerts",
            value: "2",
            description: "Temperature violations",
            icon: AlertTriangle,
            trend: { value: 1, isPositive: false },
            color: "text-red-600"
          }
        ]
      case "sales_rep":
        return [
          ...baseCards,
          {
            title: "Order Pipeline",
            value: "34",
            description: "Pending orders",
            icon: TrendingUp,
            trend: { value: 7, isPositive: true },
            color: "text-green-600"
          },
          {
            title: "POS Metrics",
            value: "89.2%",
            description: "Customer satisfaction",
            icon: Users,
            trend: { value: 2, isPositive: true },
            color: "text-blue-600"
          }
        ]
      default:
        return stats
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" suppressHydrationWarning>
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening with your pharma inventory sales system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getRoleBasedCards().map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

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
              <div className="space-y-3">
                {stockAlerts.map((alert, index) => (
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
                        alert.severity === "high"
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
