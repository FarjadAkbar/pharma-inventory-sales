"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertTriangle, FileText, Package, Factory } from "lucide-react"
import { manufacturingApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"

interface EBRStep {
  stepNumber: number
  stepName: string
  instruction: string
  description?: string
  parameters?: Record<string, any>
  performedBy?: number
  performedByName?: string
  performedAt?: Date
  eSignature?: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  remarks?: string
  attachments?: string[]
}

interface MaterialConsumption {
  id: number
  materialId: number
  materialName: string
  materialCode: string
  batchNumber: string
  plannedQuantity: number
  actualQuantity: number
  unit: string
  status: string
  consumedAt: Date
  consumedBy: number
  consumedByName?: string
}

interface EBR {
  batchId: number
  batchNumber: string
  drugId: number
  drugName: string
  drugCode: string
  siteId: number
  siteName: string
  bomVersion: number
  plannedQuantity: number
  actualQuantity?: number
  unit: string
  status: "draft" | "in_progress" | "completed" | "approved" | "rejected"
  steps: EBRStep[]
  materialConsumptions: MaterialConsumption[]
  startDate: Date
  endDate?: Date
  approvedBy?: number
  approvedByName?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
  progress: number
}

export default function EBRDetailPage() {
  const router = useRouter()
  const params = useParams()
  const batchId = params.id as string
  const [ebr, setEbr] = useState<EBR | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEBR = async () => {
      try {
        setLoading(true)
        const response = await manufacturingApi.getEBRByBatch(batchId)
        
        if (response.success && response.data) {
          setEbr(response.data)
        } else {
          toast.error("Failed to load EBR")
          router.push("/dashboard/manufacturing/ebr")
        }
      } catch (error: any) {
        console.error("Failed to fetch EBR:", error)
        toast.error(error.message || "Failed to load EBR")
        router.push("/dashboard/manufacturing/ebr")
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      fetchEBR()
    }
  }, [batchId, router])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-purple-100 text-purple-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in_progress":
        return "text-blue-600"
      case "pending":
        return "text-gray-600"
      case "skipped":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!ebr) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>EBR not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Electronic Batch Record</h1>
            <p className="text-muted-foreground">Batch: {ebr.batchNumber}</p>
          </div>
          <Badge className={getStatusBadgeColor(ebr.status)}>
            {ebr.status.charAt(0).toUpperCase() + ebr.status.slice(1).replace("_", " ")}
          </Badge>
        </div>

        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Drug</p>
                <p className="font-medium">{ebr.drugName} ({ebr.drugCode})</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Site</p>
                <p className="font-medium">{ebr.siteName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BOM Version</p>
                <p className="font-medium">v{ebr.bomVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Planned Quantity</p>
                <p className="font-medium">{ebr.plannedQuantity} {ebr.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual Quantity</p>
                <p className="font-medium">{ebr.actualQuantity || "N/A"} {ebr.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{ebr.progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Manufacturing Steps</CardTitle>
            <CardDescription>{ebr.steps.length} steps total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ebr.steps.map((step, index) => (
                <div key={step.stepNumber} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Step {step.stepNumber}: {step.stepName}</span>
                        <Badge className={getStepStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.instruction}</p>
                      {step.description && (
                        <p className="text-sm mb-2">{step.description}</p>
                      )}
                      {step.performedAt && (
                        <div className="text-xs text-muted-foreground">
                          Performed by {step.performedByName || `User ${step.performedBy}`} on {formatDateISO(step.performedAt)}
                        </div>
                      )}
                      {step.remarks && (
                        <p className="text-sm mt-2 italic">Remarks: {step.remarks}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Material Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>Material Consumption</CardTitle>
            <CardDescription>{ebr.materialConsumptions.length} materials consumed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ebr.materialConsumptions.map((consumption) => (
                <div key={consumption.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{consumption.materialName} ({consumption.materialCode})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Planned</p>
                          <p>{consumption.plannedQuantity} {consumption.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Actual</p>
                          <p>{consumption.actualQuantity} {consumption.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Batch Number</p>
                          <p>{consumption.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Consumed At</p>
                          <p>{formatDateISO(consumption.consumedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Started: {formatDateISO(ebr.startDate)}</span>
              </div>
              {ebr.endDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ended: {formatDateISO(ebr.endDate)}</span>
                </div>
              )}
              {ebr.approvedAt && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Approved: {formatDateISO(ebr.approvedAt)} by {ebr.approvedByName || `User ${ebr.approvedBy}`}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

