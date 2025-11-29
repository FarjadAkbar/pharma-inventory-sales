"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, XCircle, AlertTriangle, Eye, Beaker, Microscope, Activity, Target, TestTube } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { QCTest } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"

export default function ViewQCTestPage() {
  const router = useRouter()
  const params = useParams()
  const [qcTest, setQCTest] = useState<QCTest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchQCTest(params.id as string)
    }
  }, [params.id])

  const fetchQCTest = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getQCTests({ search: id, limit: 1 })
      if (response.success && response.data?.qcTests?.length > 0) {
        setQCTest(response.data.qcTests[0])
      } else {
        throw new Error("QC test not found")
      }
    } catch (error) {
      console.error("Failed to fetch QC test:", error)
      router.push("/dashboard/quality/qc-tests")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQCTest = async () => {
    if (confirm(`Are you sure you want to delete QC Test ${qcTest?.code}?`)) {
      try {
        const response = await apiService.deleteQCTest(qcTest!.id)
        if (response.success) {
          router.push("/dashboard/quality/qc-tests")
        } else {
          alert("Failed to delete QC test")
        }
      } catch (error) {
        console.error("Failed to delete QC test:", error)
        alert("Failed to delete QC test")
      }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Physical":
        return <Beaker className="h-4 w-4" />
      case "Chemical":
        return <TestTube className="h-4 w-4" />
      case "Microbiological":
        return <Microscope className="h-4 w-4" />
      case "Stability":
        return <Clock className="h-4 w-4" />
      case "Dissolution":
        return <Activity className="h-4 w-4" />
      case "Content Uniformity":
        return <Target className="h-4 w-4" />
      case "Assay":
        return <CheckCircle className="h-4 w-4" />
      case "Impurities":
        return <AlertTriangle className="h-4 w-4" />
      case "Identification":
        return <Eye className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Physical': 'bg-blue-100 text-blue-800',
      'Chemical': 'bg-green-100 text-green-800',
      'Microbiological': 'bg-purple-100 text-purple-800',
      'Stability': 'bg-yellow-100 text-yellow-800',
      'Dissolution': 'bg-orange-100 text-orange-800',
      'Content Uniformity': 'bg-pink-100 text-pink-800',
      'Assay': 'bg-indigo-100 text-indigo-800',
      'Impurities': 'bg-red-100 text-red-800',
      'Identification': 'bg-gray-100 text-gray-800'
    }
    return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>
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

  if (!qcTest) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">QC test not found</h1>
          <p className="text-muted-foreground mt-2">The QC test you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quality/qc-tests">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to QC Tests
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{qcTest.name}</h1>
              <p className="text-muted-foreground">QC Test Method Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/quality/qc-tests/${qcTest.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteQCTest}>
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
                <label className="text-sm font-medium text-muted-foreground">Test Code</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{qcTest.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Test Name</label>
                <p className="text-lg font-semibold">{qcTest.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(qcTest.category)}
                  {getCategoryBadge(qcTest.category)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Method</label>
                <p className="text-lg">{qcTest.method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit</label>
                <p className="text-lg">{qcTest.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={qcTest.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {qcTest.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Details */}
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-lg">{qcTest.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Equipment Required</label>
                <p className="text-lg">{qcTest.equipmentRequired || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Test Duration</label>
                <p className="text-lg">{qcTest.duration || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temperature</label>
                <p className="text-lg">{qcTest.temperature || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-lg">{qcTest.createdByName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDateISO(qcTest.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Test Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qcTest.specifications.map((spec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Parameter</label>
                      <p className="font-semibold">{spec.parameter}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Specification</label>
                      <p className="text-lg">{spec.specification}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit</label>
                      <p className="text-lg">{spec.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <Badge variant="outline">{spec.type}</Badge>
                    </div>
                  </div>
                  {spec.description && (
                    <div className="mt-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm">{spec.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {qcTest.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{qcTest.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
