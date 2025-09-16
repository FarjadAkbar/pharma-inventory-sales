"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { Drug } from "@/types/pharma"
import { formatDateISO } from "@/lib/utils"

export default function ViewDrugPage() {
  const router = useRouter()
  const params = useParams()
  const [drug, setDrug] = useState<Drug | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchDrug(params.id as string)
    }
  }, [params.id])

  const fetchDrug = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getDrugs({ search: id, limit: 1 })
      if (response.success && response.data?.drugs?.length > 0) {
        setDrug(response.data.drugs[0])
      } else {
        throw new Error("Drug not found")
      }
    } catch (error) {
      console.error("Failed to fetch drug:", error)
      router.push("/dashboard/drugs")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDrug = async () => {
    if (confirm(`Are you sure you want to delete ${drug?.name}?`)) {
      try {
        const response = await apiService.deleteDrug(drug!.id)
        if (response.success) {
          router.push("/dashboard/drugs")
        } else {
          alert("Failed to delete drug")
        }
      } catch (error) {
        console.error("Failed to delete drug:", error)
        alert("Failed to delete drug")
      }
    }
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
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

  if (!drug) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Drug not found</h1>
          <p className="text-muted-foreground mt-2">The drug you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/drugs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Drugs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{drug.name}</h1>
              <p className="text-muted-foreground">Drug Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/drugs/${drug.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteDrug}>
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
                <label className="text-sm font-medium text-muted-foreground">Drug Code</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{drug.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Drug Name</label>
                <p className="text-lg font-semibold">{drug.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chemical Formula</label>
                <p className="font-mono">{drug.formula}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Strength</label>
                <p className="text-lg">{drug.strength}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                <Badge variant="outline">{drug.dosageForm}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Route of Administration</label>
                <Badge variant="outline">{drug.route}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Classification & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Classification & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Therapeutic Class</label>
                <p className="text-lg">{drug.therapeuticClass || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                <p className="text-lg">{drug.manufacturer || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approval Status</label>
                <div className="mt-1">
                  {getApprovalStatusBadge(drug.approvalStatus)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={drug.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {drug.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDateISO(drug.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {drug.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{drug.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
