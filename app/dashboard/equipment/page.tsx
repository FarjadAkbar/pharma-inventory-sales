"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Wrench, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Equipment {
  id: string
  name: string
  code: string
  type: "manufacturing" | "testing" | "packaging" | "storage" | "utility"
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  siteId: string
  siteName: string
  location: string
  status: "operational" | "maintenance" | "broken" | "retired"
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  maintenanceInterval: number // days
  calibrationDate: string
  nextCalibrationDate: string
  calibrationInterval: number // days
  isCalibrated: boolean
  isActive: boolean
  specifications: Record<string, any>
  createdAt: string
  updatedAt: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchEquipment()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await apiService.getEquipment({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const equipmentData = response.data as {
          equipment: Equipment[]
          pagination: { page: number; pages: number; total: number }
        }
        setEquipment(equipmentData.equipment || [])
        setPagination(equipmentData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
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

  const handleEdit = (equipment: Equipment) => {
    window.location.href = `/dashboard/equipment/${equipment.id}`
  }

  const handleDelete = async (equipment: Equipment) => {
    if (confirm(`Are you sure you want to delete equipment "${equipment.name}"?`)) {
      try {
        await apiService.deleteEquipment(equipment.id)
        fetchEquipment()
      } catch (error) {
        console.error("Failed to delete equipment:", error)
      }
    }
  }

  const handleToggleStatus = async (equipment: Equipment) => {
    try {
      await apiService.updateEquipment(equipment.id, { isActive: !equipment.isActive })
      fetchEquipment()
    } catch (error) {
      console.error("Failed to toggle equipment status:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "manufacturing":
        return "bg-blue-100 text-blue-800"
      case "testing":
        return "bg-green-100 text-green-800"
      case "packaging":
        return "bg-purple-100 text-purple-800"
      case "storage":
        return "bg-orange-100 text-orange-800"
      case "utility":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "broken":
        return "bg-red-100 text-red-800"
      case "retired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isMaintenanceDue = (equipment: Equipment) => {
    const nextMaintenance = new Date(equipment.nextMaintenanceDate)
    const now = new Date()
    const daysUntilMaintenance = (nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilMaintenance <= 7 && daysUntilMaintenance > 0
  }

  const isMaintenanceOverdue = (equipment: Equipment) => {
    const nextMaintenance = new Date(equipment.nextMaintenanceDate)
    const now = new Date()
    return nextMaintenance < now
  }

  const isCalibrationDue = (equipment: Equipment) => {
    const nextCalibration = new Date(equipment.nextCalibrationDate)
    const now = new Date()
    const daysUntilCalibration = (nextCalibration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilCalibration <= 7 && daysUntilCalibration > 0
  }

  const isCalibrationOverdue = (equipment: Equipment) => {
    const nextCalibration = new Date(equipment.nextCalibrationDate)
    const now = new Date()
    return nextCalibration < now
  }

  const calculateStats = () => {
    const operationalEquipment = equipment.filter(e => e.status === "operational").length
    const maintenanceDue = equipment.filter(e => isMaintenanceDue(e) || isMaintenanceOverdue(e)).length
    const calibrationDue = equipment.filter(e => isCalibrationDue(e) || isCalibrationOverdue(e)).length
    const brokenEquipment = equipment.filter(e => e.status === "broken").length

    return { operationalEquipment, maintenanceDue, calibrationDue, brokenEquipment }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Equipment",
      render: (equipment: Equipment) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{equipment.name}</div>
            <div className="text-sm text-muted-foreground">{equipment.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (equipment: Equipment) => (
        <Badge className={getTypeBadgeColor(equipment.type)}>
          {equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "manufacturer",
      header: "Manufacturer",
      render: (equipment: Equipment) => (
        <div className="text-sm">
          <div className="font-medium">{equipment.manufacturer}</div>
          <div className="text-muted-foreground">{equipment.model}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (equipment: Equipment) => (
        <div className="text-sm">
          <div className="font-medium">{equipment.siteName}</div>
          <div className="text-muted-foreground">{equipment.location}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (equipment: Equipment) => (
        <Badge className={getStatusBadgeColor(equipment.status)}>
          {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "maintenance",
      header: "Maintenance",
      render: (equipment: Equipment) => {
        const isDue = isMaintenanceDue(equipment)
        const isOverdue = isMaintenanceOverdue(equipment)
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm ${
              isOverdue ? "text-red-600" : isDue ? "text-yellow-600" : "text-green-600"
            }`}>
              {formatDateISO(equipment.nextMaintenanceDate)}
            </span>
            {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {isDue && !isOverdue && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>
        )
      },
    },
    {
      key: "calibration",
      header: "Calibration",
      render: (equipment: Equipment) => {
        const isDue = isCalibrationDue(equipment)
        const isOverdue = isCalibrationOverdue(equipment)
        return (
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm ${
              isOverdue ? "text-red-600" : isDue ? "text-yellow-600" : "text-green-600"
            }`}>
              {formatDateISO(equipment.nextCalibrationDate)}
            </span>
            {equipment.isCalibrated && <CheckCircle className="h-3 w-3 text-green-500" />}
            {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {isDue && !isOverdue && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
            <p className="text-muted-foreground">Manage manufacturing equipment and maintenance schedules</p>
          </div>

          <PermissionGuard module="MASTER_DATA" screen="equipment" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/equipment/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.operationalEquipment}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceDue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broken</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.brokenEquipment}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter equipment by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "manufacturing", label: "Manufacturing" },
                    { value: "testing", label: "Testing" },
                    { value: "packaging", label: "Packaging" },
                    { value: "storage", label: "Storage" },
                    { value: "utility", label: "Utility" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={typeFilter === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "operational", label: "Operational" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "broken", label: "Broken" },
                    { value: "retired", label: "Retired" },
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
            </div>
          </CardContent>
        </Card>

        {/* Equipment Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Equipment</CardTitle>
            <CardDescription>A list of all equipment with maintenance and calibration schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={equipment}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search equipment..."
              actions={(equipment: Equipment) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="MASTER_DATA" screen="equipment" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(equipment)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="MASTER_DATA" screen="equipment" action="update">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(equipment)}
                    >
                      {equipment.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="MASTER_DATA" screen="equipment" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(equipment)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
