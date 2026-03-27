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
import { distributionApi } from "@/services"
import { toast } from "sonner"
import type { SalesOrder } from "@/types/distribution"
import { formatMoneyAmount } from "@/lib/utils"

/** Align with shipments list filters where possible */
const CARRIER_OPTIONS = [
  "Express Logistics",
  "Fast Track",
  "Reliable Transport",
  "DHL",
  "FedEx",
  "UPS",
  "National Courier",
  "Other (specify in remarks)",
] as const

const SERVICE_TYPE_OPTIONS = [
  "Standard",
  "Express",
  "Overnight",
  "Same day",
  "Ground",
  "Economy",
  "Temperature controlled / Cold chain",
  "Freight / LTL",
] as const

export default function NewShipmentPage() {
  const router = useRouter()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shipmentDate: "",
    expectedDeliveryDate: "",
    carrier: CARRIER_OPTIONS[0],
    serviceType: SERVICE_TYPE_OPTIONS[0],
    priority: "Normal",
    remarks: "",
  })

  useEffect(() => {
    fetchApprovedSalesOrders()
  }, [])

  const fetchApprovedSalesOrders = async () => {
    try {
      const response = await distributionApi.getSalesOrders({ status: "Approved" })
      if (response.success && response.data) {
        const raw = response.data as any
        const list = raw.data ?? raw.salesOrders ?? (Array.isArray(raw) ? raw : [])
        setSalesOrders(Array.isArray(list) ? list : [])
      }
    } catch (error) {
      console.error("Error fetching sales orders:", error)
      toast.error("Failed to fetch approved sales orders")
    }
  }

  const handleSalesOrderSelect = (orderId: string) => {
    const order = salesOrders.find(o => o.id.toString() === orderId)
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
      // Server loads approved SO from sales-order-service and snapshots lines, customer, site, address.
      const shipmentData = {
        salesOrderId: parseInt(String(selectedSalesOrder.id), 10),
        shipmentDate: formData.shipmentDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        carrier: formData.carrier,
        serviceType: formData.serviceType,
        priority: formData.priority,
        remarks: formData.remarks || undefined,
      }

      const response = await distributionApi.createShipment(shipmentData)
      
      if (response.success) {
        toast.success("Shipment created successfully")
        const created = response.data as { id?: number } | undefined
        const id = created?.id ?? (response.data as any)?.data?.id
        if (id != null) {
          router.push(`/dashboard/sales/shipments/${id}`)
        } else {
          router.push("/dashboard/sales/shipments")
        }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Shipment</h1>
          <p className="text-muted-foreground">
            Customer, site, address, and line quantities are taken from the sales order on the server—only logistics fields are sent from the UI.
          </p>
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
                  <Select value={selectedSalesOrder?.id?.toString() || ""} onValueChange={handleSalesOrderSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sales order" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
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
                    <div className="text-sm text-muted-foreground tabular-nums">
                      Total amount:{" "}
                      {formatMoneyAmount(
                        selectedSalesOrder.totalAmount,
                        selectedSalesOrder.currency,
                      )}
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
                      <Select
                        value={formData.carrier}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, carrier: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select carrier" />
                        </SelectTrigger>
                        <SelectContent>
                          {CARRIER_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Service type *</Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/sales/shipments")}>
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

