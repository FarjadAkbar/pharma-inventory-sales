"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Thermometer, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Package,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Droplets,
  Activity,
  Bell,
  Shield
} from "lucide-react"
import { apiService } from "@/services/api.service"
import { TemperatureExcursionForm } from "@/components/sales/temperature-excursion-form"
import { toast } from "sonner"
import type { ColdChainRecord, TemperatureExcursion } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export default function ColdChainPage() {
  const [coldChainRecords, setColdChainRecords] = useState<ColdChainRecord[]>([])
  const [temperatureExcursions, setTemperatureExcursions] = useState<TemperatureExcursion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"records" | "excursions">("records")

  useEffect(() => {
    fetchColdChainData()
  }, [searchQuery, activeTab])

  const fetchColdChainData = async () => {
    try {
      setLoading(true)
      if (activeTab === "records") {
        const response = await apiService.getColdChainRecords({
          search: searchQuery,
        })
        if (response.success && response.data) {
          setColdChainRecords(response.data.records || [])
        }
      } else {
        const response = await apiService.getTemperatureExcursions({
          search: searchQuery,
        })
        if (response.success && response.data) {
          setTemperatureExcursions(response.data.excursions || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch cold chain data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleView = (item: any) => {
    console.log("View item:", item)
    // TODO: Implement view functionality
  }

  const handleEdit = (item: any) => {
    console.log("Edit item:", item)
    // TODO: Implement edit functionality
  }

  const handleResolve = async (excursion: TemperatureExcursion) => {
    try {
      const response = await apiService.updateTemperatureExcursion(excursion.id, {
        ...excursion,
        status: "Resolved"
      })
      
      if (response.success) {
        toast.success("Temperature excursion resolved")
        fetchColdChainData()
      } else {
        toast.error("Failed to resolve excursion")
      }
    } catch (error) {
      console.error("Error resolving excursion:", error)
      toast.error("Failed to resolve excursion")
    }
  }

  const handleDelete = async (item: any) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        let response
        if (activeTab === "records") {
          response = await apiService.deleteColdChainRecord(item.id)
        } else {
          response = await apiService.deleteTemperatureExcursion(item.id)
        }
        
        if (response.success) {
          toast.success("Item deleted successfully")
          fetchColdChainData()
        } else {
          toast.error("Failed to delete item")
        }
      } catch (error) {
        console.error("Error deleting item:", error)
        toast.error("Failed to delete item")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Normal</Badge>
      case "Warning":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>
      case "Alert":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Alert</Badge>
      case "Critical":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Critical</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Low":
        return <Badge className="bg-blue-100 text-blue-800"><Bell className="h-3 w-3 mr-1" />Low</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Medium</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />High</Badge>
      case "Critical":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Critical</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getExcursionStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "Acknowledged":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Acknowledged</Badge>
      case "Resolved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>
      case "Closed":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Package className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const totalRecords = coldChainRecords.length
    const normalRecords = coldChainRecords.filter(record => record.status === "Normal").length
    const warningRecords = coldChainRecords.filter(record => record.status === "Warning").length
    const alertRecords = coldChainRecords.filter(record => record.status === "Alert").length
    const criticalRecords = coldChainRecords.filter(record => record.status === "Critical").length

    const totalExcursions = temperatureExcursions.length
    const activeExcursions = temperatureExcursions.filter(excursion => excursion.status === "Active").length
    const resolvedExcursions = temperatureExcursions.filter(excursion => excursion.status === "Resolved").length

    return { 
      totalRecords, normalRecords, warningRecords, alertRecords, criticalRecords,
      totalExcursions, activeExcursions, resolvedExcursions
    }
  }

  const stats = calculateStats()

  const coldChainColumns = [
    {
      key: "shipmentNumber",
      header: "Shipment #",
      render: (record: ColdChainRecord) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {record.shipmentNumber}
        </div>
      ),
    },
    {
      key: "drug",
      header: "Drug",
      render: (record: ColdChainRecord) => (
        <div>
          <div className="flex items-center gap-2">
            {getDrugIcon(record.drugName)}
            <span className="font-medium">{record.drugName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{record.batchNumber}</div>
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temperature",
      render: (record: ColdChainRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {record.temperature}°C
          </div>
          <div className="text-muted-foreground">
            Sensor: {record.sensorId}
          </div>
        </div>
      ),
    },
    {
      key: "humidity",
      header: "Humidity",
      render: (record: ColdChainRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {record.humidity}%
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (record: ColdChainRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {record.location}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record: ColdChainRecord) => getStatusBadge(record.status),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (record: ColdChainRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(record.timestamp)}
          </div>
        </div>
      ),
    },
  ]

  const excursionColumns = [
    {
      key: "excursionNumber",
      header: "Excursion #",
      render: (excursion: TemperatureExcursion) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {excursion.excursionNumber}
        </div>
      ),
    },
    {
      key: "shipment",
      header: "Shipment",
      render: (excursion: TemperatureExcursion) => (
        <div className="text-sm">
          <div className="font-medium">{excursion.shipmentNumber}</div>
          <div className="text-muted-foreground">ID: {excursion.shipmentId}</div>
        </div>
      ),
    },
    {
      key: "drug",
      header: "Drug",
      render: (excursion: TemperatureExcursion) => (
        <div>
          <div className="flex items-center gap-2">
            {getDrugIcon(excursion.drugName)}
            <span className="font-medium">{excursion.drugName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{excursion.batchNumber}</div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (excursion: TemperatureExcursion) => getSeverityBadge(excursion.severity),
    },
    {
      key: "status",
      header: "Status",
      render: (excursion: TemperatureExcursion) => getExcursionStatusBadge(excursion.status),
    },
    {
      key: "temperature",
      header: "Temperature",
      render: (excursion: TemperatureExcursion) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {excursion.actualTemperature}°C
          </div>
          <div className="text-muted-foreground">
            Range: {excursion.minTemperature}°C - {excursion.maxTemperature}°C
          </div>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (excursion: TemperatureExcursion) => (
        <div className="text-sm">
          <div className="font-medium">{excursion.duration} minutes</div>
        </div>
      ),
    },
    {
      key: "detectedAt",
      header: "Detected At",
      render: (excursion: TemperatureExcursion) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(excursion.detectedAt)}
          </div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cold Chain Monitoring</h1>
            <p className="text-muted-foreground">Monitor temperature and humidity with excursion alerts</p>
          </div>
          <TemperatureExcursionForm onSuccess={fetchColdChainData} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Normal</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.normalRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warningRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.alertRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Excursions</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExcursions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.activeExcursions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedExcursions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "records" ? "default" : "ghost"}
                onClick={() => setActiveTab("records")}
                className={activeTab === "records" ? "bg-orange-600 hover:bg-orange-700" : ""}
              >
                <Thermometer className="mr-2 h-4 w-4" />
                Temperature Records
              </Button>
              <Button
                variant={activeTab === "excursions" ? "default" : "ghost"}
                onClick={() => setActiveTab("excursions")}
                className={activeTab === "excursions" ? "bg-orange-600 hover:bg-orange-700" : ""}
              >
                <Bell className="mr-2 h-4 w-4" />
                Temperature Excursions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab === "records" ? "temperature records" : "excursions"}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Data Table */}
            <UnifiedDataTable
              data={activeTab === "records" ? coldChainRecords : temperatureExcursions}
              columns={activeTab === "records" ? coldChainColumns : excursionColumns}
              loading={loading}
              onSearch={handleSearch}
              searchPlaceholder={`Search ${activeTab === "records" ? "temperature records" : "excursions"}...`}
              actions={(item: any) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {activeTab === "excursions" && item.status === "Active" && (
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleResolve(item)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
