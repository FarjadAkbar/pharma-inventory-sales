"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Thermometer,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Droplets
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { TemperatureLog } from "@/types/warehouse"
import { toast } from "sonner"

export default function TemperatureLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<TemperatureLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ 
    warehouseId?: number; 
    locationId?: string; 
    logType?: string;
    startDate?: string;
    endDate?: string;
  }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchTemperatureLogs()
  }, [searchQuery, filters, pagination.page])

  const fetchTemperatureLogs = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getTemperatureLogs({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setLogs(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch temperature logs:", error)
      toast.error("Failed to load temperature logs")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { 
      warehouseId?: number; 
      locationId?: string; 
      logType?: string;
      startDate?: string;
      endDate?: string;
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Normal: "default",
      Warning: "secondary",
      Critical: "destructive",
      "Out of Range": "outline",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    )
  }

  const getTemperatureColor = (log: TemperatureLog) => {
    if (log.status === "Critical" || log.status === "Out of Range") return "text-red-600 font-bold"
    if (log.status === "Warning") return "text-yellow-600"
    return "text-green-600"
  }

  const columns = [
    {
      header: "Logged At",
      accessorKey: "loggedAt",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {new Date(row.original.loggedAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "logType",
    },
    {
      header: "Temperature",
      accessorKey: "temperature",
      cell: ({ row }: any) => (
        <div className={`flex items-center gap-2 ${getTemperatureColor(row.original)}`}>
          <Thermometer className="h-4 w-4" />
          <span className="font-medium">{row.original.temperature}°C</span>
          {row.original.minThreshold && row.original.maxThreshold && (
            <span className="text-xs text-muted-foreground">
              ({row.original.minThreshold}°C - {row.original.maxThreshold}°C)
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Humidity",
      accessorKey: "humidity",
      cell: ({ row }: any) => (
        row.original.humidity ? (
          <div className="flex items-center gap-1 text-sm">
            <Droplets className="h-3 w-3" />
            {row.original.humidity}%
          </div>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      header: "Location",
      accessorKey: "locationId",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.locationId || row.original.warehouseId ? (
            <span>ID: {row.original.locationId || row.original.warehouseId}</span>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      header: "Sensor",
      accessorKey: "sensorName",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.sensorName || row.original.sensorId || "N/A"}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "logType",
      label: "Log Type",
      type: "select" as const,
      options: [
        { value: "Warehouse", label: "Warehouse" },
        { value: "Location", label: "Location" },
        { value: "Inventory Item", label: "Inventory Item" },
        { value: "Putaway", label: "Putaway" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Normal", label: "Normal" },
        { value: "Warning", label: "Warning" },
        { value: "Critical", label: "Critical" },
        { value: "Out of Range", label: "Out of Range" },
      ],
    },
  ]

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (log: TemperatureLog) => router.push(`/dashboard/warehouse/temperature/${log.id}`),
      variant: "ghost" as const,
    },
  ]

  const stats = {
    total: logs.length,
    normal: logs.filter(l => l.status === "Normal").length,
    warning: logs.filter(l => l.status === "Warning").length,
    critical: logs.filter(l => l.status === "Critical" || l.status === "Out of Range").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Temperature Logs</h1>
            <p className="text-muted-foreground">Monitor temperature and humidity readings</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/temperature/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Log Temperature
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Thermometer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Normal</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        {/* Temperature Logs Table */}
        <UnifiedDataTable
          data={logs}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search temperature logs..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          actions={actions}
          onRefresh={fetchTemperatureLogs}
          onExport={() => console.log("Export temperature logs")}
          emptyMessage="No temperature logs found. Create your first log to get started."
        />
      </div>
    </DashboardLayout>
  )
}
