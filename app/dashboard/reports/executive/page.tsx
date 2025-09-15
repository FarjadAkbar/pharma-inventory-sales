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
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Package,
  Users,
  Activity,
  Shield,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Database,
  HardDrive,
  Wifi,
  Cpu
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { ExecutiveDashboard } from "@/types/reporting"

export default function ExecutiveDashboardPage() {
  const [dashboard, setDashboard] = useState<ExecutiveDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExecutiveDashboard()
      if (response.success && response.data) {
        setDashboard(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch executive dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboard()
    setRefreshing(false)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "Critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "Info":
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "Low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-red-100 text-red-800">Active</Badge>
      case "Acknowledged":
        return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>
      case "Resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "Closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getComplianceStatus = (value: number) => {
    if (value >= 95) return { status: "Excellent", color: "text-green-600" }
    if (value >= 90) return { status: "Good", color: "text-blue-600" }
    if (value >= 80) return { status: "Fair", color: "text-yellow-600" }
    return { status: "Poor", color: "text-red-600" }
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
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">Unable to fetch executive dashboard data</p>
          <Button onClick={handleRefresh} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="mr-2 h-4 w-4" />
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
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-muted-foreground">System overview and key performance indicators</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time In-Full (OTIF)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboard.kpis.onTimeInFull}%</div>
              <p className="text-xs text-muted-foreground">Target: 95%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First Pass Yield</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard.kpis.qualityMetrics.firstPassYield}%</div>
              <p className="text-xs text-muted-foreground">Quality performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Turns</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{dashboard.kpis.inventoryTurns}</div>
              <p className="text-xs text-muted-foreground">Annual turns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboard.kpis.costMetrics.grossMargin}%</div>
              <p className="text-xs text-muted-foreground">Profitability</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue and Quality Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
              <CardDescription>Daily revenue performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.trends.revenue.slice(0, 5).map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{point.date}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">${point.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Target: ${point.target?.toLocaleString()}</div>
                      {point.value >= (point.target || 0) ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Trends
              </CardTitle>
              <CardDescription>Daily quality performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.trends.quality.slice(0, 5).map((point, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{point.date}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{point.value}%</div>
                      <div className="text-xs text-muted-foreground">Target: {point.target}%</div>
                      {point.value >= (point.target || 0) ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>Active system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      {getAlertBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health and Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Current system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm">Uptime</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.systemHealth.uptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Response Time</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.systemHealth.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Active Users</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.systemHealth.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">Data Integrity</span>
                  </div>
                  <span className="text-sm font-medium">{dashboard.systemHealth.dataIntegrity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Backup Status</span>
                  </div>
                  <Badge className={dashboard.systemHealth.backupStatus === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {dashboard.systemHealth.backupStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Metrics
              </CardTitle>
              <CardDescription>Regulatory compliance and audit readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GDP Compliance</span>
                  <span className={`text-sm font-medium ${getComplianceStatus(dashboard.compliance.gdpCompliance).color}`}>
                    {dashboard.compliance.gdpCompliance}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">FDA Compliance</span>
                  <span className={`text-sm font-medium ${getComplianceStatus(dashboard.compliance.fdaCompliance).color}`}>
                    {dashboard.compliance.fdaCompliance}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Readiness</span>
                  <span className={`text-sm font-medium ${getComplianceStatus(dashboard.compliance.auditReadiness).color}`}>
                    {dashboard.compliance.auditReadiness}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documentation</span>
                  <span className={`text-sm font-medium ${getComplianceStatus(dashboard.compliance.documentationCompleteness).color}`}>
                    {dashboard.compliance.documentationCompleteness}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Training Compliance</span>
                  <span className={`text-sm font-medium ${getComplianceStatus(dashboard.compliance.trainingCompliance).color}`}>
                    {dashboard.compliance.trainingCompliance}%
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Last Audit: {new Date(dashboard.compliance.lastAudit).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next Audit: {new Date(dashboard.compliance.nextAudit).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Findings */}
        {dashboard.compliance.findings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Findings
              </CardTitle>
              <CardDescription>Open compliance issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.compliance.findings.map((finding) => (
                  <div key={finding.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getAlertBadge(finding.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">{finding.category}</h4>
                        <Badge className="bg-yellow-100 text-yellow-800">{finding.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(finding.dueDate).toLocaleDateString()} | Assigned to: {finding.assignedTo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
