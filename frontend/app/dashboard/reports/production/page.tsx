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
  Factory, 
  CheckCircle, 
  Clock,
  DollarSign,
  Package,
  Activity,
  RefreshCw,
  Download,
  Settings,
  AlertTriangle,
  BarChart3,
  Target,
  Zap
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { ProductionDashboard } from "@/types/reporting"

export default function ProductionDashboardPage() {
  const [dashboard, setDashboard] = useState<ProductionDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProductionDashboard()
      if (response.success && response.data) {
        setDashboard(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch production dashboard:", error)
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

  const getEfficiencyColor = (value: number) => {
    if (value >= 90) return "text-green-600"
    if (value >= 80) return "text-blue-600"
    if (value >= 70) return "text-yellow-600"
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
          <p className="text-muted-foreground mb-4">Unable to fetch production dashboard data</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Production Dashboard</h1>
            <p className="text-muted-foreground">Batch efficiency and yield analysis</p>
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

        {/* Production Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.productionMetrics.totalBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboard.productionMetrics.completedBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboard.productionMetrics.inProgressBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboard.productionMetrics.rejectedBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yield</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard.productionMetrics.yield}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dashboard.efficiency.overallEfficiency)}`}>
                {dashboard.efficiency.overallEfficiency}%
              </div>
              <p className="text-xs text-muted-foreground">Production efficiency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Utilization</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dashboard.efficiency.equipmentUtilization)}`}>
                {dashboard.efficiency.equipmentUtilization}%
              </div>
              <p className="text-xs text-muted-foreground">Equipment usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Labor Efficiency</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dashboard.efficiency.laborEfficiency)}`}>
                {dashboard.efficiency.laborEfficiency}%
              </div>
              <p className="text-xs text-muted-foreground">Labor productivity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Material Efficiency</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dashboard.efficiency.materialEfficiency)}`}>
                {dashboard.efficiency.materialEfficiency}%
              </div>
              <p className="text-xs text-muted-foreground">Material usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First Pass Yield</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(dashboard.quality.firstPassYield)}`}>
                {dashboard.quality.firstPassYield}%
              </div>
              <p className="text-xs text-muted-foreground">Quality performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rework Rate</CardTitle>
              <RefreshCw className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboard.quality.reworkRate}%</div>
              <p className="text-xs text-muted-foreground">Rework required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scrap Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboard.quality.scrapRate}%</div>
              <p className="text-xs text-muted-foreground">Material waste</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Costs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard.quality.qualityCosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Quality-related costs</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products
            </CardTitle>
            <CardDescription>Best performing products by quantity and value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{product.quantity.toLocaleString()} units</div>
                      <div className="text-xs text-muted-foreground">Quantity</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${product.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Value</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{product.performance}%</div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </div>
                    <div className="flex-shrink-0">
                      {getTrendIcon(product.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Production Trends
            </CardTitle>
            <CardDescription>Daily batch production trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.productionTrends.slice(0, 7).map((point, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{point.date}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{point.value} batches</div>
                    {index > 0 && (
                      point.value > dashboard.productionTrends[index - 1].value ? (
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

        {/* Efficiency Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Efficiency Breakdown
              </CardTitle>
              <CardDescription>Detailed efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Efficiency</span>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${getEfficiencyColor(dashboard.efficiency.overallEfficiency)}`}>
                      {dashboard.efficiency.overallEfficiency}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.efficiency.overallEfficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Equipment Utilization</span>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${getEfficiencyColor(dashboard.efficiency.equipmentUtilization)}`}>
                      {dashboard.efficiency.equipmentUtilization}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.efficiency.equipmentUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Labor Efficiency</span>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${getEfficiencyColor(dashboard.efficiency.laborEfficiency)}`}>
                      {dashboard.efficiency.laborEfficiency}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.efficiency.laborEfficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Material Efficiency</span>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${getEfficiencyColor(dashboard.efficiency.materialEfficiency)}`}>
                      {dashboard.efficiency.materialEfficiency}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.efficiency.materialEfficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Quality Summary
              </CardTitle>
              <CardDescription>Quality performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">First Pass Yield</span>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${getPerformanceColor(dashboard.quality.firstPassYield)}`}>
                      {dashboard.quality.firstPassYield}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.quality.firstPassYield}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rework Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-yellow-600">{dashboard.quality.reworkRate}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.quality.reworkRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scrap Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-red-600">{dashboard.quality.scrapRate}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.quality.scrapRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium">Quality Costs</div>
                  <div className="text-2xl font-bold text-orange-600">${dashboard.quality.qualityCosts.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
