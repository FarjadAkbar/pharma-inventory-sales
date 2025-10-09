"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import Link from "next/link"
import { rawMaterialsApi, sitesApi } from "@/services"
import type { RawMaterial } from "@/types/raw-materials"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useAuth } from "@/contexts/auth.context"

export default function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      const response = await rawMaterialsApi.getRawMaterials()

      if (response.status && response.data) {
        const materials = Array.isArray(response.data) ? response.data : [response.data]
        setRawMaterials(materials)
      }
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRawMaterial = async (rawMaterial: RawMaterial) => {
    if (confirm(`Are you sure you want to delete ${rawMaterial.raw_material_name}?`)) {
      try {
        const response = await rawMaterialsApi.deleteRawMaterial(rawMaterial.id)
        if (response.status) {
          fetchRawMaterials() // Refresh the list
        } else {
          alert("Failed to delete raw material")
        }
      } catch (error) {
        console.error("Failed to delete raw material:", error)
        alert("Failed to delete raw material")
      }
    }
  }

  const calculateStats = () => {
    const total = rawMaterials.length
    const active = rawMaterials.filter(rm => rm.status === "Active").length
    const inactive = rawMaterials.filter(rm => rm.status === "InActive").length

    return { total, active, inactive }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (rm: RawMaterial) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {rm.code}
        </div>
      ),
    },
    {
      key: "raw_material_name",
      header: "Material Name",
      sortable: true,
      render: (rm: RawMaterial) => (
        <div>
          <div className="font-medium">{rm.raw_material_name}</div>
          <div className="text-sm text-muted-foreground">{rm.description}</div>
        </div>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      sortable: true,
      render: (rm: RawMaterial) => (
        <Badge className="bg-blue-100 text-blue-800">
          {rm.grade || "N/A"}
        </Badge>
      ),
    },
    {
      key: "storage_req",
      header: "Storage Requirements",
      sortable: true,
      render: (rm: RawMaterial) => (
        <div className="text-sm text-muted-foreground">
          {rm.storage_req || "N/A"}
        </div>
      ),
    },
    {
      key: "unit_name",
      header: "Unit",
      sortable: true,
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          <div className="font-medium">{rm.unit_name}</div>
          <div className="text-muted-foreground">{rm.unit_type}</div>
        </div>
      ),
    },
    {
      key: "supplier_name",
      header: "Supplier",
      sortable: true,
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          <div className="font-medium">{rm.supplier_name}</div>
          <div className="text-muted-foreground">{rm.supplier_code}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (rm: RawMaterial) => (
        <Badge className={rm.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {rm.status}
        </Badge>
      ),
    },
  ]

  const actions = (rm: RawMaterial) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" screen="raw-materials" action="read">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/raw-materials/${rm.id}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="raw-materials" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/raw-materials/${rm.id}/edit`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="raw-materials" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteRawMaterial(rm)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raw Materials Management</h1>
            <p className="text-muted-foreground">Manage pharmaceutical raw materials and excipients</p>
          </div>
          <PermissionGuard module="MASTER_DATA" screen="raw-materials" action="create">
            <Link href="/dashboard/raw-materials/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Raw Material
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Materials</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Materials</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Raw Materials Table */}
        <UnifiedDataTable
          data={rawMaterials}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search raw materials..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          actions={actions}
          onRefresh={fetchRawMaterials}
          onExport={() => console.log("Export raw materials")}
          emptyMessage="No raw materials found. Add your first raw material to get started."
        />
      </div>
    </DashboardLayout>
  )
}
