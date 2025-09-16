"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { RawMaterial } from "@/types/pharma"
import { formatDateISO } from "@/lib/utils"

export default function ViewRawMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const [rawMaterial, setRawMaterial] = useState<RawMaterial | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchRawMaterial(params.id as string)
    }
  }, [params.id])

  const fetchRawMaterial = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getRawMaterials({ search: id, limit: 1 })
      if (response.success && response.data?.rawMaterials?.length > 0) {
        setRawMaterial(response.data.rawMaterials[0])
      } else {
        throw new Error("Raw material not found")
      }
    } catch (error) {
      console.error("Failed to fetch raw material:", error)
      router.push("/dashboard/raw-materials")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRawMaterial = async () => {
    if (confirm(`Are you sure you want to delete ${rawMaterial?.name}?`)) {
      try {
        const response = await apiService.deleteRawMaterial(rawMaterial!.id)
        if (response.success) {
          router.push("/dashboard/raw-materials")
        } else {
          alert("Failed to delete raw material")
        }
      } catch (error) {
        console.error("Failed to delete raw material:", error)
        alert("Failed to delete raw material")
      }
    }
  }

  const getStockStatus = (current: number, reorderLevel: number) => {
    if (current <= reorderLevel) {
      return { status: "low", color: "text-red-600", icon: TrendingDown }
    } else if (current <= reorderLevel * 1.5) {
      return { status: "medium", color: "text-yellow-600", icon: AlertTriangle }
    } else {
      return { status: "good", color: "text-green-600", icon: CheckCircle }
    }
  }

  const getGradeBadge = (grade: string) => {
    const colors = {
      'USP': 'bg-blue-100 text-blue-800',
      'Pharmaceutical': 'bg-green-100 text-green-800',
      'Food Grade': 'bg-yellow-100 text-yellow-800',
      'Industrial': 'bg-gray-100 text-gray-800',
      'Analytical': 'bg-purple-100 text-purple-800'
    }
    return <Badge className={colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!rawMaterial) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Raw material not found</h1>
          <p className="text-muted-foreground mt-2">The raw material you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  const stockStatus = getStockStatus(rawMaterial.currentStock, rawMaterial.reorderLevel)
  const StockIcon = stockStatus.icon

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/raw-materials">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Raw Materials
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{rawMaterial.name}</h1>
              <p className="text-muted-foreground">Raw Material Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/raw-materials/${rawMaterial.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteRawMaterial}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material Code</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{rawMaterial.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material Name</label>
                <p className="text-lg font-semibold">{rawMaterial.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Grade</label>
                <div className="mt-1">
                  {getGradeBadge(rawMaterial.grade)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit of Measure</label>
                <p className="text-lg">{rawMaterial.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-lg">{rawMaterial.supplierName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={rawMaterial.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {rawMaterial.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock & Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                <div className="flex items-center gap-2">
                  <StockIcon className={`h-4 w-4 ${stockStatus.color}`} />
                  <p className="text-lg font-semibold">{rawMaterial.currentStock} {rawMaterial.unitOfMeasure}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Level</label>
                <p className="text-lg">{rawMaterial.reorderLevel} {rawMaterial.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cost per Unit</label>
                <p className="text-lg font-semibold">${rawMaterial.costPerUnit.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                <p className="text-lg font-semibold text-blue-600">
                  ${(rawMaterial.currentStock * rawMaterial.costPerUnit).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shelf Life</label>
                <p className="text-lg">{rawMaterial.shelfLife ? `${rawMaterial.shelfLife} days` : "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Storage Requirements</label>
                <p className="text-lg">{rawMaterial.storageRequirements || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {rawMaterial.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{rawMaterial.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
