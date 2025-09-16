"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface TemperatureLog {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  sensorId: string
  sensorName: string
  temperature: number
  humidity: number
  unit: "celsius" | "fahrenheit"
  minThreshold: number
  maxThreshold: number
  status: "normal" | "warning" | "critical"
  recordedAt: string
  siteId: string
  siteName: string
  zone: string
  createdAt: string
}

export default function TemperatureLogsPage() {
  const [logs, setLogs] = useState<TemperatureLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")

  useEffect(() => {
    fetchTemperatureLogs()
  }, [searchQuery, pagination.page, statusFilter, timeRange])

  const fetchTemperatureLogs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTemperatureLogs({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        timeRange: timeRange,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const logData = response.data as {
          logs: TemperatureLog[]
          pagination: { page: number; pages: number; total: number }
        }
        setLogs(logData.logs || [])
        setPagination(logData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch temperature logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTemperatureColor = (log: TemperatureLog) => {
    if (log.status === "critical") return "text-red-600"
    if (log.status === "warning") return "text-yellow-600"
    return "text-green-600"
  }

  const getTemperatureIcon = (log: TemperatureLog) => {
    if (log.status === "critical") return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (log.status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const calculateStats = () => {
    const normalLogs = logs.filter(l => l.status === "normal").length
    const warningLogs = logs.filter(l => l.status === "warning").length
    const criticalLogs = logs.filter(l => l.status === "critical").length
    const avgTemperature = logs.length > 0 
      ? (logs.reduce((sum, l) => sum + l.temperature, 0) / logs.length).toFixed(1)
      : "0.0"

    return { normalLogs, warningLogs, criticalLogs, avgTemperature }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "location",
      header: "Location",
      render: (log: TemperatureLog) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Thermometer className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{log.locationName}</div>
            <div className="text-sm text-muted-foreground">{log.locationCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: "site",
      header: "Site",
      render: (log: TemperatureLog) => (
        <div className="text-sm">
          <div className="font-medium">{log.siteName}</div>
          <div className="text-muted-foreground">{log.zone}</div>
        </div>
      ),
    },
    {
      key: "sensor",
      header: "Sensor",
      render: (log: TemperatureLog) => (
        <div className="text-sm">
          <div className="font-medium">{log.sensorName}</div>
          <div className="text-muted-foreground">ID: {log.sensorId}</div>
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temperature",
      render: (log: TemperatureLog) => (
        <div className="flex items-center gap-2">
          {getTemperatureIcon(log)}
          <span className={`text-lg font-medium ${getTemperatureColor(log)}`}>
            {log.temperature}°{log.unit.charAt(0).toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: "humidity",
      header: "Humidity",
      render: (log: TemperatureLog) => (
        <div className="text-sm">
          <div className="font-medium">{log.humidity}%</div>
        </div>
      ),
    },
    {
      key: "thresholds",
      header: "Thresholds",
      render: (log: TemperatureLog) => (
        <div className="text-sm">
          <div>Min: {log.minThreshold}°{log.unit.charAt(0).toUpperCase()}</div>
          <div>Max: {log.maxThreshold}°{log.unit.charAt(0).toUpperCase()}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (log: TemperatureLog) => (
        <Badge className={getStatusBadgeColor(log.status)}>
          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "recordedAt",
      header: "Recorded",
      render: (log: TemperatureLog) => (
        <div className="text-sm">
          <div className="font-medium">{formatDateISO(log.recordedAt)}</div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Temperature Logs</h1>
            <p className="text-muted-foreground">Monitor warehouse temperature and humidity conditions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Normal</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.normalLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warningLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalLogs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter temperature logs by status and time range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "normal", label: "Normal" },
                    { value: "warning", label: "Warning" },
                    { value: "critical", label: "Critical" },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "1h", label: "Last Hour" },
                    { value: "24h", label: "Last 24 Hours" },
                    { value: "7d", label: "Last 7 Days" },
                    { value: "30d", label: "Last 30 Days" },
                  ].map((range) => (
                    <Button
                      key={range.value}
                      variant={timeRange === range.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range.value)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature Monitoring</CardTitle>
            <CardDescription>Real-time temperature and humidity readings from warehouse sensors.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={logs}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search temperature logs..."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
