"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Play, CheckCircle, Package, Beaker, AlertTriangle, Plus } from "lucide-react"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"
import type { Batch, BatchStep, MaterialConsumption } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"
import { MaterialConsumptionForm } from "@/components/manufacturing/material-consumption-form"
import { BatchStepForm } from "@/components/manufacturing/batch-step-form"
import { FinishedGoodsReceiptForm } from "@/components/manufacturing/finished-goods-receipt-form"

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [steps, setSteps] = useState<BatchStep[]>([])
  const [consumptions, setConsumptions] = useState<MaterialConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [stepDialogOpen, setStepDialogOpen] = useState(false)
  const [finishedGoodsDialogOpen, setFinishedGoodsDialogOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBatch()
      fetchSteps()
      fetchConsumptions()
    }
  }, [params.id])

  const fetchBatch = async () => {
    try {
      setLoading(true)
      const response = await manufacturingApi.getBatch(params.id as string)
      if (response.success && response.data) {
        setBatch(response.data)
      } else if (response.data && !response.success) {
        // Handle case where data is returned directly
        setBatch(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch batch:", error)
      toast.error("Failed to load batch")
    } finally {
      setLoading(false)
    }
  }

  const fetchSteps = async () => {
    try {
      const response = await manufacturingApi.getBatchSteps(params.id as string)
      if (response.success && response.data) {
        setSteps(Array.isArray(response.data) ? response.data : [])
      } else if (Array.isArray(response)) {
        setSteps(response)
      } else if (Array.isArray(response.data)) {
        setSteps(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch steps:", error)
    }
  }

  const fetchConsumptions = async () => {
    try {
      const response = await manufacturingApi.getMaterialConsumption(params.id as string)
      if (response.success && response.data) {
        setConsumptions(Array.isArray(response.data) ? response.data : [])
      } else if (Array.isArray(response)) {
        setConsumptions(response)
      } else if (Array.isArray(response.data)) {
        setConsumptions(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch consumptions:", error)
    }
  }

  const handleStartBatch = async () => {
    try {
      const response = await manufacturingApi.startBatch(params.id as string, {
        startedBy: 1, // TODO: Get from auth context
      })
      if (response.success || response.data) {
        toast.success("Batch started successfully")
        fetchBatch()
      }
    } catch (error) {
      toast.error("Failed to start batch")
    }
  }

  const handleCompleteBatch = async (hasFault: boolean, faultDescription?: string) => {
    try {
      const response = await manufacturingApi.completeBatch(params.id as string, {
        hasFault,
        faultDescription,
        completedBy: 1, // TODO: Get from auth context
      })
      if (response.success || response.data) {
        toast.success("Batch completed successfully")
        if (hasFault) {
          // Submit to QC
          await manufacturingApi.submitBatchToQC(params.id as string, {
            faultDescription: faultDescription || "",
            quantity: batch?.actualQuantity || batch?.plannedQuantity || 0,
            unit: batch?.unit || "",
            requestedBy: 1,
          })
        }
        fetchBatch()
      }
    } catch (error) {
      toast.error("Failed to complete batch")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Completed": "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Planned": "bg-yellow-100 text-yellow-800",
      "QC Pending": "bg-orange-100 text-orange-800",
      "Draft": "bg-gray-100 text-gray-800",
      "Failed": "bg-red-100 text-red-800",
    }
    return <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
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

  if (!batch) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Batch not found</div>
        </div>
      </DashboardLayout>
    )
  }

  const canStart = batch.status === "Draft" || batch.status === "Planned"
  const canExecute = batch.status === "In Progress"
  const canComplete = batch.status === "In Progress"
  const canReceiveGoods = batch.status === "Completed"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{batch.batchNumber}</h1>
              <p className="text-muted-foreground">{batch.drugName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(batch.status)}
            {canStart && (
              <Button onClick={handleStartBatch}>
                <Play className="h-4 w-4 mr-2" />
                Start Batch
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="material-consumption">
              Material Consumption ({consumptions.length})
            </TabsTrigger>
            <TabsTrigger value="steps">Batch Steps ({steps.length})</TabsTrigger>
            {batch.status === "QC Pending" && (
              <TabsTrigger value="qc">QC Status</TabsTrigger>
            )}
            {canReceiveGoods && (
              <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Work Order</div>
                    <div className="font-medium">{batch.workOrderNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Drug</div>
                    <div className="font-medium">{batch.drugName} ({batch.drugCode})</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Planned Quantity</div>
                    <div className="font-medium">{batch.plannedQuantity} {batch.unit}</div>
                  </div>
                  {batch.actualQuantity && (
                    <div>
                      <div className="text-sm text-muted-foreground">Actual Quantity</div>
                      <div className="font-medium">{batch.actualQuantity} {batch.unit}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Planned Start</div>
                    <div className="font-medium">{formatDateISO(batch.plannedStartDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Planned End</div>
                    <div className="font-medium">{formatDateISO(batch.plannedEndDate)}</div>
                  </div>
                  {batch.actualStartDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Actual Start</div>
                      <div className="font-medium">{formatDateISO(batch.actualStartDate)}</div>
                    </div>
                  )}
                  {batch.actualEndDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Actual End</div>
                      <div className="font-medium">{formatDateISO(batch.actualEndDate)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {batch.hasFault && batch.faultDescription && (
                <Card className="md:col-span-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      Fault Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{batch.faultDescription}</p>
                  </CardContent>
                </Card>
              )}

              {canComplete && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Complete Batch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCompleteBatch(false)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete (No Fault)
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const desc = prompt("Enter fault description:")
                          if (desc) handleCompleteBatch(true, desc)
                        }}
                        className="flex-1"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Complete (With Fault)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="material-consumption" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Material Consumption</CardTitle>
                {canExecute && (
                  <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Consume Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Consume Material</DialogTitle>
                      </DialogHeader>
                      <MaterialConsumptionForm
                        batchId={params.id as string}
                        onSuccess={() => {
                          setMaterialDialogOpen(false)
                          fetchConsumptions()
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {consumptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No material consumption recorded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {consumptions.map((consumption) => (
                      <div
                        key={consumption.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{consumption.materialName}</div>
                          <div className="text-sm text-muted-foreground">
                            Batch: {consumption.batchNumber} • {consumption.actualQuantity} {consumption.unit}
                          </div>
                        </div>
                        <Badge>{consumption.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Batch Steps</CardTitle>
                {canExecute && (
                  <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Execute Step
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Execute Batch Step</DialogTitle>
                      </DialogHeader>
                      <BatchStepForm
                        batchId={params.id as string}
                        onSuccess={() => {
                          setStepDialogOpen(false)
                          fetchSteps()
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {steps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No steps executed yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            Step {step.stepNumber}: {step.stepName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {step.instruction}
                          </div>
                        </div>
                        <Badge>{step.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {batch.status === "QC Pending" && (
            <TabsContent value="qc" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>QC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    Batch submitted to QC. QC Sample ID: {batch.qcSampleId || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canReceiveGoods && (
            <TabsContent value="finished-goods" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receive Finished Goods</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={finishedGoodsDialogOpen} onOpenChange={setFinishedGoodsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Package className="h-4 w-4 mr-2" />
                        Receive Finished Goods
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Receive Finished Goods</DialogTitle>
                      </DialogHeader>
                      <FinishedGoodsReceiptForm
                        batchId={params.id as string}
                        batch={batch}
                        onSuccess={() => {
                          setFinishedGoodsDialogOpen(false)
                          fetchBatch()
                          toast.success("Finished goods received. Putaway item created.")
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

