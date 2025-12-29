"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Plus, Package, Calendar, User, FileText } from "lucide-react"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"
import type { WorkOrder, Batch } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchWorkOrder()
      fetchBatches()
    }
  }, [params.id])

  const fetchWorkOrder = async () => {
    try {
      setLoading(true)
      const response = await manufacturingApi.getWorkOrder(params.id as string)
      if (response.success && response.data) {
        setWorkOrder(response.data)
      } else if (response.data && !response.success) {
        setWorkOrder(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch work order:", error)
      toast.error("Failed to load work order")
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await manufacturingApi.getBatches({ workOrderId: params.id as string })
      if (response.success && response.data) {
        setBatches(Array.isArray(response.data) ? response.data : [])
      } else if (Array.isArray(response)) {
        setBatches(response)
      } else if (Array.isArray(response.data)) {
        setBatches(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Completed": "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Planned": "bg-yellow-100 text-yellow-800",
      "On Hold": "bg-orange-100 text-orange-800",
      "Draft": "bg-gray-100 text-gray-800",
      "Cancelled": "bg-red-100 text-red-800",
    }
    return <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      "Urgent": "bg-red-100 text-red-800",
      "High": "bg-orange-100 text-orange-800",
      "Normal": "bg-blue-100 text-blue-800",
      "Low": "bg-gray-100 text-gray-800",
    }
    return <Badge className={variants[priority] || "bg-gray-100 text-gray-800"}>{priority}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!workOrder) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Work order not found</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{workOrder.workOrderNumber}</h1>
              <p className="text-muted-foreground">{workOrder.drugName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(workOrder.status)}
            {getPriorityBadge(workOrder.priority)}
            <Button variant="outline" onClick={() => router.push(`/dashboard/manufacturing/work-orders/${workOrder.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => router.push(`/dashboard/manufacturing/batches/new?workOrderId=${workOrder.id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="batches">Batches ({batches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Drug</div>
                    <div className="font-medium">{workOrder.drugName} ({workOrder.drugCode})</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Planned Quantity</div>
                    <div className="font-medium">{workOrder.plannedQuantity} {workOrder.unit}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">BOM Version</div>
                    <div className="font-medium">{workOrder.bomVersion}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Planned Start</div>
                    <div className="font-medium">{formatDateISO(workOrder.plannedStartDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Planned End</div>
                    <div className="font-medium">{formatDateISO(workOrder.plannedEndDate)}</div>
                  </div>
                  {workOrder.actualStartDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Actual Start</div>
                      <div className="font-medium">{formatDateISO(workOrder.actualStartDate)}</div>
                    </div>
                  )}
                  {workOrder.actualEndDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Actual End</div>
                      <div className="font-medium">{formatDateISO(workOrder.actualEndDate)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Site</div>
                    <div className="font-medium">{workOrder.siteName}</div>
                  </div>
                  {workOrder.assignedToName && (
                    <div>
                      <div className="text-sm text-muted-foreground">Assigned To</div>
                      <div className="font-medium">{workOrder.assignedToName}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {workOrder.remarks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{workOrder.remarks}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Associated Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No batches created for this work order
                  </div>
                ) : (
                  <div className="space-y-2">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/manufacturing/batches/${batch.id}`)}
                      >
                        <div>
                          <div className="font-medium">{batch.batchNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.status} • {batch.plannedQuantity} {batch.unit}
                          </div>
                        </div>
                        <Badge>{batch.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

