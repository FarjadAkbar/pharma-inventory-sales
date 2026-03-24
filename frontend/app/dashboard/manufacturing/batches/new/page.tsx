"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beaker, FileText } from "lucide-react"
import { manufacturingApi } from "@/services"
import type { WorkOrder } from "@/types/manufacturing"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewBatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workOrderId = searchParams.get("workOrderId")

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    // If opened with workOrderId, load that work order
    if (!workOrderId) return

    const loadWorkOrder = async () => {
      try {
        setLoading(true)
        const response = await manufacturingApi.getWorkOrder(workOrderId)
        if (response.success && response.data) {
          setWorkOrder(response.data as WorkOrder)
        } else if (response.data && !response.success) {
          setWorkOrder(response.data as WorkOrder)
        } else {
          throw new Error("Work order not found")
        }
      } catch (error) {
        console.error("Failed to load work order for batch:", error)
        toast.error("Failed to load work order")
      } finally {
        setLoading(false)
      }
    }

    loadWorkOrder()
  }, [workOrderId])

  useEffect(() => {
    // If not opened from a work order, load work orders list for selection
    if (workOrderId) return

    const loadWorkOrders = async () => {
      try {
        setLoading(true)
        const response = await manufacturingApi.getWorkOrders({ page: 1, limit: 100 })
        if (response.success && response.data) {
          const raw = response.data as any
          const list = Array.isArray(raw) ? raw : raw.workOrders ?? []
          setWorkOrders(Array.isArray(list) ? list : [])
        } else if (Array.isArray(response)) {
          setWorkOrders(response as any)
        }
      } catch (error) {
        console.error("Failed to load work orders:", error)
        toast.error("Failed to load work orders")
      } finally {
        setLoading(false)
      }
    }

    loadWorkOrders()
  }, [workOrderId])

  const effectiveWorkOrder = useMemo(() => {
    if (workOrder) return workOrder
    if (!selectedWorkOrderId) return null
    return workOrders.find((w) => w.id?.toString() === selectedWorkOrderId) ?? null
  }, [workOrder, selectedWorkOrderId, workOrders])

  const handleCreateBatch = async () => {
    const wo = effectiveWorkOrder
    if (!wo) {
      router.push("/dashboard/manufacturing/work-orders")
      return
    }

    try {
      setCreating(true)
      const payload = {
        workOrderId: parseInt(wo.id, 10),
        workOrderNumber: wo.workOrderNumber,
        drugId: parseInt(wo.drugId, 10),
        drugName: wo.drugName,
        drugCode: wo.drugCode,
        siteId: parseInt(wo.siteId, 10),
        siteName: wo.siteName,
        plannedQuantity: wo.plannedQuantity,
        unit: wo.unit,
        bomVersion: wo.bomVersion,
        status: "Planned",
        priority: wo.priority,
        plannedStartDate: wo.plannedStartDate,
        plannedEndDate: wo.plannedEndDate,
        remarks: wo.remarks,
        createdBy: parseInt(wo.createdBy, 10) || 1,
      }

      const response = await manufacturingApi.createBatch(payload)
      if (response.success && response.data) {
        toast.success("Batch created successfully")
        const batch = response.data as any
        router.push(`/dashboard/manufacturing/batches/${batch.id ?? batch.batchId ?? ""}`)
      } else {
        throw new Error(response.message || "Failed to create batch")
      }
    } catch (error) {
      console.error("Failed to create batch:", error)
      toast.error("Failed to create batch")
    } finally {
      setCreating(false)
    }
  }

  const hasWorkOrderContext = !!workOrderId

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Batch</h1>
          <p className="text-muted-foreground">
            {hasWorkOrderContext
              ? "Review the work order and create a production batch."
              : "Create a new production batch from a work order."}
          </p>
        </div>

        {/* Create batch (from work order context or selection) */}
        {(hasWorkOrderContext || !hasWorkOrderContext) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Create batch from work order
              </CardTitle>
              <CardDescription>
                {hasWorkOrderContext ? `Work Order ${workOrderId}` : "Select a work order to create a batch"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasWorkOrderContext && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Work Order *</div>
                  <Select value={selectedWorkOrderId} onValueChange={setSelectedWorkOrderId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading work orders..." : "Select work order"} />
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.workOrderNumber} — {w.drugName} ({w.drugCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {loading || !effectiveWorkOrder ? (
                <div className="text-muted-foreground">
                  {hasWorkOrderContext ? "Loading work order details..." : "Select a work order to see details."}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Work Order</div>
                    <div className="font-medium">
                      {effectiveWorkOrder.workOrderNumber} — {effectiveWorkOrder.drugName} ({effectiveWorkOrder.drugCode})
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-medium">
                      {effectiveWorkOrder.plannedQuantity} {effectiveWorkOrder.unit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Site</div>
                    <div className="font-medium">{effectiveWorkOrder.siteName}</div>
                  </div>
                  <Button onClick={handleCreateBatch} disabled={creating || (!hasWorkOrderContext && !selectedWorkOrderId)}>
                    {creating ? "Creating..." : "Create Batch"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
