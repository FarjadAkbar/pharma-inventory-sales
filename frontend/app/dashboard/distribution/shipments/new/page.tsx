"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { distributionApi } from "@/services/distribution-api.service"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"
import type { SalesOrder } from "@/types/distribution"

export default function NewShipmentPage() {
  const router = useRouter()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shipmentDate: "",
    expectedDeliveryDate: "",
    carrier: "",
    serviceType: "",
    priority: "Normal",
    remarks: "",
  })

  useEffect(() => {
    fetchApprovedSalesOrders()
  }, [])

  const fetchApprovedSalesOrders = async () => {
    try {
      const response = await apiService.getSalesOrders({ status: "Approved" })
      if (response.success && response.data) {
        const data = response.data.data || response.data
        setSalesOrders(Array.isArray(data) ? data : data.salesOrders || [])
      }
    } catch (error) {
      console.error("Error fetching sales orders:", error)
      toast.error("Failed to fetch approved sales orders")
    }
  }

  const handleSalesOrderSelect = (orderId: string) => {
    const order = salesOrders.find(o => o.id === orderId)
    setSelectedSalesOrder(order || null)
    if (order) {
      setFormData(prev => ({
        ...prev,
        shipmentDate: order.requestedShipDate.split('T')[0],
        expectedDeliveryDate: order.requestedShipDate.split('T')[0],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSalesOrder) {
      toast.error("Please select a sales order")
      return
    }

    try {
      setLoading(true)
      const shipmentData = {
        salesOrderId: parseInt(selectedSalesOrder.id),
        salesOrderNumber: selectedSalesOrder.orderNumber,
        accountId: parseInt(selectedSalesOrder.accountId),
        accountName: selectedSalesOrder.accountName,
        siteId: parseInt(selectedSalesOrder.siteId),
        siteName: selectedSalesOrder.siteName,
        shipmentDate: formData.shipmentDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        carrier: formData.carrier,
        serviceType: formData.serviceType,
        priority: formData.priority,
        shippingAddress: selectedSalesOrder.shippingAddress,
        items: selectedSalesOrder.items.map(item => ({
          drugId: parseInt(item.drugId),
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchNumber: item.preferredBatchNumber || "",
          quantity: item.quantity,
          unit: item.unit,
        })),
        remarks: formData.remarks,
        createdBy: 1, // TODO: Get from auth context
      }

      const response = await distributionApi.createShipment(shipmentData)
      
      if (response.success) {
        toast.success("Shipment created successfully")
        router.push(`/dashboard/distribution/shipments/${response.data.id}`)
      } else {
        toast.error("Failed to create shipment")
      }
    } catch (error) {
      console.error("Error creating shipment:", error)
      toast.error("Failed to create shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/distribution/shipments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plan Shipment</h1>
            <p className="text-muted-foreground">Create a new shipment from an approved sales order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Sales Order</CardTitle>
              <CardDescription>Choose an approved sales order to create shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Sales Order *</Label>
                  <Select value={selectedSalesOrder?.id || ""} onValueChange={handleSalesOrderSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sales order" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - {order.accountName} ({order.items.length} items)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSalesOrder && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="font-medium">Order Details</div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {selectedSalesOrder.accountName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Items: {selectedSalesOrder.items.length} items, {selectedSalesOrder.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Amount: {selectedSalesOrder.totalAmount} {selectedSalesOrder.currency}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedSalesOrder && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Shipment Date *</Label>
                      <Input
                        type="date"
                        value={formData.shipmentDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, shipmentDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Expected Delivery Date *</Label>
                      <Input
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Carrier *</Label>
                      <Input
                        value={formData.carrier}
                        onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                        placeholder="Enter carrier name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Service Type *</Label>
                      <Input
                        value={formData.serviceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                        placeholder="Enter service type"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter any special instructions or remarks"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/distribution/shipments")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Shipment"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}

