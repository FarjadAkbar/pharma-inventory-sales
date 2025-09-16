"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, XCircle, FileText, FileCheck, User, Calendar, Package, Beaker, Activity, Target, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { BOM } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"

export default function ViewBOMPage() {
  const router = useRouter()
  const params = useParams()
  const [bom, setBOM] = useState<BOM | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBOM(params.id as string)
    }
  }, [params.id])

  const fetchBOM = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getBOMs({ search: id, limit: 1 })
      if (response.success && response.data?.boms?.length > 0) {
        setBOM(response.data.boms[0])
      } else {
        throw new Error("BOM not found")
      }
    } catch (error) {
      console.error("Failed to fetch BOM:", error)
      router.push("/dashboard/manufacturing/boms")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBOM = async () => {
    if (confirm(`Are you sure you want to delete BOM ${bom?.bomNumber}?`)) {
      try {
        const response = await apiService.deleteBOM(bom!.id)
        if (response.success) {
          router.push("/dashboard/manufacturing/boms")
        } else {
          alert("Failed to delete BOM")
        }
      } catch (error) {
        console.error("Failed to delete BOM:", error)
        alert("Failed to delete BOM")
      }
    }
  }

  const handleApproveBOM = async () => {
    if (confirm(`Are you sure you want to approve BOM ${bom?.bomNumber}?`)) {
      try {
        const response = await apiService.approveBOM(bom!.id)
        if (response.success) {
          fetchBOM(params.id as string) // Refresh data
        } else {
          alert("Failed to approve BOM")
        }
      } catch (error) {
        console.error("Failed to approve BOM:", error)
        alert("Failed to approve BOM")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800"><FileCheck className="h-3 w-3 mr-1" />Approved</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
      case "Obsolete":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Obsolete</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Beaker className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Activity className="h-4 w-4" />
    return <Target className="h-4 w-4" />
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

  if (!bom) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">BOM not found</h1>
          <p className="text-muted-foreground mt-2">The BOM you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/manufacturing/boms">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to BOMs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">BOM #{bom.bomNumber}</h1>
              <p className="text-muted-foreground">Bill of Materials Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bom.status === "Draft" && (
              <Button onClick={handleApproveBOM} className="bg-blue-600 hover:bg-blue-700">
                <FileCheck className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            <Link href={`/dashboard/manufacturing/boms/${bom.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteBOM}>
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
                <label className="text-sm font-medium text-muted-foreground">BOM Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{bom.bomNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Drug</label>
                <div className="flex items-center gap-2">
                  {getDrugIcon(bom.drugName)}
                  <div>
                    <p className="text-lg font-semibold">{bom.drugName}</p>
                    <p className="text-sm text-muted-foreground">{bom.drugCode}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Version</label>
                <Badge variant="outline" className="font-mono text-lg">v{bom.version}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(bom.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Effective Date</label>
                <p className="text-lg flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {bom.effectiveDate ? formatDateISO(bom.effectiveDate) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Batch Size</label>
                <p className="text-lg font-semibold">{bom.batchSize || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Yield</label>
                <p className="text-lg">{bom.yield || "N/A"}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Items</label>
                <p className="text-lg flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {bom.items.length} materials
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Critical Items</label>
                <p className="text-lg flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  {bom.items.filter(item => item.isCritical).length} critical
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-lg flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {bom.createdByName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDateISO(bom.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOM Items */}
        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bom.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Material</label>
                      <p className="font-semibold">{item.materialName}</p>
                      <p className="text-sm text-muted-foreground">{item.materialCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Quantity per Batch</label>
                      <p className="text-lg font-semibold">{item.quantityPerBatch} {item.unitOfMeasure}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tolerance</label>
                      <p className="text-lg">±{item.tolerance}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Critical</label>
                      <div className="mt-1">
                        {item.isCritical ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.remarks && (
                    <div className="mt-2">
                      <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                      <p className="text-sm">{item.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {bom.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{bom.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
