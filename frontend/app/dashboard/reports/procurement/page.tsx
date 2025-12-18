"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  CheckCircle, 
  Clock,
  DollarSign,
  Package,
  Users,
  Activity,
  RefreshCw,
  Download,
  Settings,
  AlertTriangle,
  BarChart3,
  Target
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { ProcurementDashboard } from "@/types/reporting"

export default function ProcurementDashboardPage() {
  const [dashboard, setDashboard] = useState<ProcurementDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProcurementDashboard()
      if (response.success && response.data) {
        setDashboard(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch procurement dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboard()
    setRefreshing(false)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 95) return "text-green-600"
    if (value >= 90) return "text-blue-600"
    if (value >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">Unable to fetch procurement dashboard data</p>
          <Button onClick={handleRefresh} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Procurement Dashboard</h1>
            <p className="text-muted-foreground">Supplier performance and cost analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download />
              Export
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Purchase Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.purchaseOrders.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboard.purchaseOrders.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboard.purchaseOrders.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard.purchaseOrders.received}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboard.purchaseOrders.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard.costAnalysis.totalSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard.costAnalysis.averageOrderValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${dashboard.costAnalysis.costSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Achieved savings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Variance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.costAnalysis.priceVariance}%</div>
              <p className="text-xs text-muted-foreground">From budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(dashboard.supplierMetrics.onTimeDelivery)}`}>
                {dashboard.supplierMetrics.onTimeDelivery}%
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(dashboard.supplierMetrics.qualityScore)}`}>
                {dashboard.supplierMetrics.qualityScore}%
              </div>
              <p className="text-xs text-muted-foreground">Average quality</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(dashboard.supplierMetrics.complianceRate)}`}>
                {dashboard.supplierMetrics.complianceRate}%
              </div>
              <p className="text-xs text-muted-foreground">Regulatory compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Suppliers
            </CardTitle>
            <CardDescription>Best performing suppliers by value and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topSuppliers.map((supplier, index) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{supplier.name}</h4>
                      <p className="text-xs text-muted-foreground">{supplier.orders} orders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">${supplier.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total value</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{supplier.performance}%</div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </div>
                    <div className="flex-shrink-0">
                      {getTrendIcon(supplier.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cost Trends
            </CardTitle>
            <CardDescription>Daily procurement spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.costTrends.slice(0, 7).map((point, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{point.date}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">${point.value.toLocaleString()}</div>
                    {index > 0 && (
                      point.value > dashboard.costTrends[index - 1].value ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Supplier Performance Details
            </CardTitle>
            <CardDescription>Detailed performance metrics for all suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.supplierPerformance.map((supplier) => (
                <div key={supplier.supplierId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">{supplier.supplierName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{supplier.totalOrders} orders</Badge>
                      <Badge className="bg-green-100 text-green-800">${supplier.totalValue.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">On-Time Delivery</div>
                      <div className={`text-sm font-medium ${getPerformanceColor(supplier.onTimeDelivery)}`}>
                        {supplier.onTimeDelivery}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Quality Score</div>
                      <div className={`text-sm font-medium ${getPerformanceColor(supplier.qualityScore)}`}>
                        {supplier.qualityScore}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Compliance Rate</div>
                      <div className={`text-sm font-medium ${getPerformanceColor(supplier.complianceRate)}`}>
                        {supplier.complianceRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Avg Lead Time</div>
                      <div className="text-sm font-medium">{supplier.averageLeadTime} days</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
